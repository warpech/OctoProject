const { GraphQLClient } = require('graphql-request');
const args = require('yargs').argv;

if (!args.token) {
	console.error("GitHub personal access token is missing. Provide it with --token=XXXXX");
	process.exit(1);
}

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
  console.log("querying for query", query);
  console.log("querying for page", pageNum);

  var after = "";
  if (cursor) {
    after = `, after: "${cursor}"`;
  }

  const graphQlQuery = `query {
  search(first: 10, type: ISSUE, query: "${query}" ${after}) {
  	pageInfo {
      startCursor
      hasNextPage
      endCursor
    }
    edges {
      node {
        ... on Issue {
          title
          url
          state
        }
        ... on PullRequest {
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
      console.log(issue);
    });

    //console.log("hasNextPage", data.search.pageInfo.hasNextPage);
    if (data.search.pageInfo.hasNextPage) {
      pageNum++;
      return fetchPage(issues, query, pageNum, data.search.pageInfo.endCursor);
    } else {
      return true;
    }

  }).catch((err) => {
    console.log("error", err)
  });
}



var queries = [
  "repo:Starcounter/Blending",
  "repo:Starcounter/DevTools"
];
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
  Promise.all(promises).then(() => {
    console.log("FINISHED");
  });
}

fetchPages(issues, queries);
