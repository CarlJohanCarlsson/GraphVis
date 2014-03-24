/*
* Copyright (c) <YEAR>, <OWNER>
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
Gets the JSON structured in the same manner as http://bl.ocks.org/mbostock/4062045 .
*/
function orderJSONinOneGraph( returnedObject ) {
  visualizationNodes = returnedObject.nodes;
  visualizationLinks = returnedObject.links;
}

/*
Checks and returns the nodes in a format acceptable to vis.js
This functions assumes that either all objects are for D3 or for vis.
*/
function verifyJSONForVisjsNodes( returnedObject ) {
  var returnedNodes = returnedObject.nodes;

  if(returnedNodes[0]!=null&&(!_.has(returnedNodes[0], "id"))) {
    for(var iterator = 0; iterator<returnedNodes.length; iterator++) {
      returnedNodes[iterator].id = iterator;
    }
  }

  return returnedNodes;
}

/*
Checks and returns the edges in a format acceptable to vis.js.
This functions assumes that either all objects are for D3 or for vis.
*/
function verifyJSONForVisjsEdges( returnedObject ) {
  var returnedEdges = returnedObject.links;

  if(returnedEdges[0]!=null&&_.has(returnedEdges[0], "target")) {
    for(var iterator = returnedEdges.length-1; iterator>=0; iterator--) {
      returnedEdges[iterator].from = returnedEdges[iterator].source;
      delete returnedEdges[iterator].source;
      returnedEdges[iterator].to = returnedEdges[iterator].target;
      delete returnedEdges[iterator].target;
    }
  }

  for(var iterator = returnedEdges.length-1; iterator>=0; iterator--) {
   delete returnedEdges[iterator]["id"];
   delete returnedEdges[iterator].id;
  }

  return returnedEdges;
}

/*
Can be done shorter and easier but meh, serves it purpose, prints out a JSON presentation of the links and nodes ignoring d3js unique values.
*/
function printJSONOutput () {
  var textToTextField="";
  textToTextField += '{"nodes":[';

     for(var iterator = 0; iterator < nodesInteraction.length; iterator++) {
       var keys = _.keys(nodesInteraction[iterator]);
       textToTextField += '{';
       for(var key = 0; key < keys.length; key++){
         if(!_.contains(d3NodeKeyValues, keys[key])) {
           textToTextField += '"'+keys[key]+'":"'+nodesInteraction[iterator][keys[key]]+'",';
         }
       }
       if(textToTextField.charAt(textToTextField.length -1)==',') {
         textToTextField = textToTextField.slice(0, -1); //"Removes" last character
       }
       textToTextField += '},';
     }
  if(textToTextField.charAt(textToTextField.length - 1)==',') {
    textToTextField = textToTextField.slice(0, -1); //"Removes" last character
  }
  textToTextField += '], "links":[';
  for (var iterator = 0; iterator < links.length; iterator++) {
    var keys = _.keys(links[iterator]);
    textToTextField += '{';
    for(var key = 0; key < keys.length; key++) {
      if(!_.contains(d3NodeKeyValues, keys[key])) {
        textToTextField += '"'+keys[key]+'":"'+links[iterator][keys[key]]+'",';
      }
    }
    textToTextField+= '"source":'+links[iterator]["source"].index+','
    +'"target":'+links[iterator]["target"].index+'},';
  }
  if(textToTextField.charAt(textToTextField.length - 1)==',') {
    textToTextField = textToTextField.slice(0, -1); //"Removes" last character
  }
  textToTextField += ']}';
  if(developing) {
    console.log(textToTextField);
  }

  databaseOutput[0][0].value = textToTextField;
}

/*
Calls updateVisualization with the returned object.
*/
function sendToDatabase() {
  var xhr_object = null;

		var xhr_object = new XMLHttpRequest();
		xhr_object.open("POST", "http://localhost:8888/db/jena");
		xhr_object.setRequestHeader('Accept-Language', 'sv-se');
		xhr_object.setRequestHeader('Accept', 'application/json; charset=UTF-8');
		xhr_object.onreadystatechange = function() {
			if (xhr_object.readyState == 4 && xhr_object.status == 200) {
        var responseObject = JSON.parse(xhr_object.responseText);
        console.log(responseObject);
				updateVisualization(responseObject);
        updateTextAreaWithTextResponse("Test1");
        updateTextAreaWithSPARQLQuery("Test2");
			}
		}

    var requestToDatabase = databaseOutput[0][0].value;

		//console.log(requestToDatabase);
		xhr_object.send(requestToDatabase);
}

function updateTextAreaWithTextResponse( textResponse ) {
  var textArea = document.getElementById("SPARQLResponseTextArea");
  textArea.innerHTML = textResponse;
}

function updateTextAreaWithSPARQLQuery( SPARQLText ) {
  var textArea = document.getElementById("SPARQLQueryTextArea");
  textArea.innerHTML = SPARQLText;
}

function requestFromDatabaseWithPrefix( prefix, message, callingFunction ) {
  var xhr_object = new XMLHttpRequest();
	xhr_object.open("POST", "http://localhost:8888/"+prefix);
	xhr_object.setRequestHeader('Accept-Language', 'sv-se');
	xhr_object.setRequestHeader('Accept', 'application/json; charset=UTF-8');
	xhr_object.onreadystatechange = function() {
	if (xhr_object.readyState == 4 && xhr_object.status == 200) {
    var responseObject = JSON.parse(xhr_object.responseText);
		callingFunction(responseObject);
	  }
	}
  xhr_object.send();
}

function getPredicatesForInteraction( responseObject ) {
  if(responseObject==null) {
    requestFromDatabaseWithPrefix("db-predicates", null, getPredicatesForInteraction)
  } else {
    console.log(responseObject);
    updatePredicatesForInteraction(responseObject.edgetypes);
  }
}

function updatePredicatesForInteraction( types ) {
  var selector = document.getElementById("selectionOfType");
  if(types.length>0) {
    selectorInnerHTML = "<select id='typeSelector'>";
    selectorInnerHTML += "<option value='?'>?</option>"
    for(var iterator=0; iterator<=types.length; iterator++) {
      //console.log("Added "+types[iterator]);
      selectorInnerHTML += "<option value='"+types[iterator]+"'>"+
        types[iterator] + "</option>";
    }
    selectorInnerHTML += "</select>"
    selector.innerHTML = selectorInnerHTML;
  } else {
    //TODO
  }
}

function getLiteralsForInteraction() {

}

function updateLiteralsForInteraction() {

}
