#!/usr/bin/env node

const { GraphQLClient } = require('graphql-request');
const args = require('yargs').argv;
const { applyNewIssuesToSnapshot } = require('./project_snapshot.js');
const resolvePath = require('resolve-path');


if (!args.token) {
	console.error("GitHub personal access token is missing. Provide it with --token=XXXXX");
	process.exit(1);
}
if (!args.config) {
	console.error("Path to the config file is missing. Provide it with --config=XXXXX");
	process.exit(1);
}

var configFullPath = resolvePath(process.cwd(), args.config)
var file = require(configFullPath);
if (!file.queries) {
	console.error("Config file does not contain 'queries' array");
	process.exit(1);
}
const queries = file.queries;

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${args.token}`,
  },
})

function convertNodeToCursor(node) {
  return bota(node.id.toString());
}

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString("base64");
}

var issues = [];

function fetchPage(data, query, pageNum, cursor) {
  //console.log("querying for query", query);
  //console.log("querying for page", pageNum);

  var after = "";
  if (cursor) {
    after = `, after: "${cursor}"`;
  }

  const graphQlQuery = `query {
  search(first: 100, type: ISSUE, query: "${query}" ${after}) {
  	pageInfo {
      startCursor
      hasNextPage
      endCursor
    }
    edges {
      node {
        ... on Issue {
          repository {
            name
          }
          title
          url
          state
        }
        ... on PullRequest {
          repository {
            name
          }
          title
          url
          state
        }
      }
    }
  }
}`

  return client.request(graphQlQuery).then((data) => {
    data.search.edges.forEach((issue) => {
      if(!issues.find(node => node.url == issue.node.url)) {
        issues.push(issue.node);
      }
    });

    issues.sort((a, b) => a.url < b.url);

    //console.log("hasNextPage", data.search.pageInfo.hasNextPage);
    if (data.search.pageInfo.hasNextPage) {
      pageNum++;
      return fetchPage(issues, query, pageNum, data.search.pageInfo.endCursor);
    } else {
      return true;
    }

  }).catch((err) => {
    console.error("Error in GraphQL request", err);
    process.exit(1);
  });
}

/*
function recursiveAll( array ) {
    // Wait for the promises to resolve
    return Promise.all( array ).then(function( result ) {
        // If no new promises were added, return the result
        if ( result.length == array.length )
            return result;
        // If new promises were added, re-evaluate the array.
        return recursiveAll( array );
    });
}*/

function fetchPages(issues, queries) {
  var promises = [];
  queries.forEach((query) => {
    let pageNum = 1;
    var promise = fetchPage(issues, query, pageNum);
    promises.push(promise);
  });
  return Promise.all(promises).then(() => {
  	return issues;
  }).catch((err) => {
    console.error("Error in fetching pages", err);
    process.exit(1);
  });
}




function fetchAll (oldSnapshot) {
	fetchPages(issues, queries).then((issues) => {
      var res = applyNewIssuesToSnapshot(issues, oldSnapshot, args.unmatched);
      const lines = res.split("\n");
      lines.forEach(line => process.stdout.write(`${line}\n`));
      process.exit();
    }).catch((err) => {
      console.error("Error in creating Markdown", err);
      process.exit(1);
    });
}

const getStdin = require('get-stdin');
 

var noStdIn = setTimeout(() => {
	fetchAll();
}, 1000);

getStdin().then(str => {
	clearTimeout(noStdIn);
	fetchAll(str);
});
