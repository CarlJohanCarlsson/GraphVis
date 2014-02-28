package g1.database;

import java.io.*;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.ResultSetFormatter;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.util.FileManager;
import com.google.gson.Gson;
import com.google.gson.reflect.*;

public class RDFDatabase {
	private static Model model;
	
	public RDFDatabase(String inputFile)
	{        
		// create an empty model
        model = ModelFactory.createDefaultModel();
       
        // use the FileManager to find the input file
        InputStream in = FileManager.get().open(inputFile);
        if (in == null) {
            throw new IllegalArgumentException( "File: " + inputFile + " not found");
        }
        
        // read the RDF/XML file
        model.read( in, "" );
	
	    System.out.println("RDFCreated and Waiting");
	}
	
	public String queryDB(String queryString)
	{
    Graph g = new Graph();
    //Gson gson = new Gson();
    //Graph g = gson.fromJson(queryString, Graph.class);

    System.out.println(g);
    System.out.println(g.nodes.get(0));
    System.out.println(queryString);
    if(true)
      return queryString;    
    Query query = QueryFactory.create(queryString) ;
        QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
        try {
          ResultSet results = qexec.execSelect() ;
          ByteArrayOutputStream out = new ByteArrayOutputStream();
          ResultSetFormatter.outputAsRDF(out, "RDFJSON", results);
          //ResultSetFormatter.out(out, results, query);
          String result = new String(out.toString());
          return result;
        } finally { qexec.close() ; }
	}
}
