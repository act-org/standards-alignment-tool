var currentSourceNode;
var currentTargetNode;

// Source tree funtions ****************************
function clearSourceRelationHighlights() {
  $('#sourcetree .fancytree-title').removeClass('');
}
function highlightSourceRelations() {
}

// Target tree funtions ****************************
function clearTargetRelationHighlights() {
  $('#targettree .fancytree-title').removeClass('');
}
function highlightTargetRelations() {
}

// Common tree funtions ****************************

//Open a modal that shows the node view of all the selected nodes
function loadInfoModal(tree) {  
  var results = '';
  
  //Loops through each node in the tree
  tree.visit(function(node){
    if(node.isSelected() ) {
      results += '<div class="panel panel-default"><div class="panel-heading" id="ph' + node.key +'"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#infoAccordion" href="#collapse' + node.key + '">' + node.title + '</a></h4></div>';  
    
    $.get("/node/" + node.key, function( data ) {
      var mainDiv = $("div.node div.content", data); 
      $('<div id="collapse' + node.key + '" class="panel-collapse collapse"><div class="panel-body">' + mainDiv[0].innerHTML + '</div></div></div>').appendTo('#ph'+node.key);
    });
  }
  });

  $("#infoAccordion").html(results);
} 

function updateModalSelectionInfo(selectedNodes,selection) {
  var selectedTitles = $.map(selectedNodes, function(node){
      return node.title;
  });
  var s = selectedTitles.join(", ");
  $(selection).text(s);
}
function resetWidth() {
}
function getNodeRelations(nid) {
}
function renderNode(node, type){

  if (!node.folder && node.key != "_statusNode") {
    var span = $(node.span).find("> span.fancytree-title");
    var spanIcon = $(node.span).find("> span.fancytree-icon").css({
      'background-image':'none',
      'width':0,
      'height':0
    });
    
    var field = $('#' + type+ 'Fields').val();
    var title = node.title;

    try{   
      if ( node.data.titles[field] ) {
        title = node.data.titles[field];
      }
    }
    catch(e){}

    try{
      var number_relations = typeof node.data.relations.number_relations !== 'undefined' ? node.data.relations.number_relations : 0;
    }
    catch(e) {
      var number_relations = 0;
    }
    
    span.text(title);
    span.prepend('<span class="badge">' + number_relations + '</span> ');
    span.attr('nid', 'nid-' + node.key);
  }    
}

$(document).ready(function() {


  $('#sourceCombobox').change(function() {
    var baseUrl = $(this).val();

    $('#sourcetree').fancytree('getTree').reload({url:$(this).val()});
   /* $('#sourcetree').fancytree({
      lazyLoad: function(event, data) {
        var source = "/data/1.json";
        
        data.result = {url:source};
      }
    });
    $('#sourceFields').find('option').remove();*/
  });

  $('#targetCombobox').change(function() {
    var baseUrl = $(this).val();
    $('#targettree').fancytree('getTree').reload({url:$(this).val()});
    /*$('#targettree').fancytree({
      lazyLoad: function(event, data) {
        var source = "/data/1.json";
        
        data.result = {url:source};
      }
    });
    $('#targetFields').find('option').remove();*/
  });





  $("#sourcetree").fancytree({ 
    source: [],
    lazyLoad: function(event, data){
      data.result = [];
    },
    beforeSelect: function(event, data) {
      // A node is about to be selected: prevent this, for 'folder'-nodes:
      if( data.node.isFolder() ){
        return false;
      } 
    },
    activate: function(event, data) {
      currentSourceNode = data.node;
      
      getNodeRelations(data.node.key);
      
      clearTargetRelationHighlights();
      highlightTargetRelations();
    },
    deactivate: function(event, data) {
      currentSourceNode = 'undefined';
      clearTargetRelationHighlights();
    },
    select: function(event, data) {
      var selectedNodes = data.tree.getSelectedNodes();
      updateModalSelectionInfo(selectedNodes,"#sourceSelected");
    },
    renderNode: function(event, data) {
      var node = data.node;
      
      renderNode(node, 'source');
      
      clearSourceRelationHighlights();
      highlightSourceRelations();
      
      if (data.tree.count() === (data.node.getIndex() + 1)) {
        setTimeout(resetWidth(), 1000);
      }
    },
    postProcess: function(event, data) {
      var i = 0;
      
      if (data.response[0]) {
        var fields = data.response[0].data.titles;

        $.each( fields, function( key, value ) {
          el = document.createElement( "option" );
          el.value = key;
          el.innerHTML = key;

          $( '#sourceFields' ).append( el );
        });
      }
    }
  });

  $("#targettree").fancytree({ 
    source: [],
    lazyLoad: function(event, data){
      data.result = [];
    },
    beforeSelect: function(event, data) {
      // A node is about to be selected: prevent this, for 'folder'-nodes:
      if( data.node.isFolder() ){
        return false;
      } 
    },
    activate: function(event, data) {
      currentTargetNode = data.node;
      
      getNodeRelations(data.node.key);
      
      clearTargetRelationHighlights();
      highlightTargetRelations();
    },
    deactivate: function(event, data) {
      currentTargetNode = 'undefined';
      clearTargetRelationHighlights();
    },
    select: function(event, data) {
      var selectedNodes = data.tree.getSelectedNodes();
      updateModalSelectionInfo(selectedNodes,"#targetSelected");
    },
    renderNode: function(event, data) {
      var node = data.node;
      
      renderNode(node, 'target');
      
      clearSourceRelationHighlights();
      highlightSourceRelations();
      
      if (data.tree.count() === (data.node.getIndex() + 1)) {
        setTimeout(resetWidth(), 1000);
      }
    },
    postProcess: function(event, data) {
      var i = 0;
      
      if (data.response[0]) {
        var fields = data.response[0].data.titles;

        $.each( fields, function( key, value ) {
          el = document.createElement( "option" );
          el.value = key;
          el.innerHTML = key;

          $( '#targetFields' ).append( el );
        });
      }
    }
  });

  $("button#initSource").click(function(e){
    $('#sourcetree').fancytree('getTree').reload({url:$('#sourceCombobox').val()});
  });
  
  $("button#initTarget").click(function(e){
    $('#targettree').fancytree('getTree').reload({url:$('#targetCombobox').val()});
  });

  $("button#checkSource").click(function(){
    $('#sourcetree').fancytree("getTree").visit(function(node){
      if(!node.isFolder() ) {
        node.setSelected(true);
      } 
    });
    return false;
  });

  $("button#checkTarget").click(function(){
    $('#targettree').fancytree("getTree").visit(function(node){
      if(!node.isFolder() ) {
        node.setSelected(true);
      } 
    });
    return false;
  });  

  $("button#uncheckSource").click(function(){
    $("#sourcetree").fancytree("getTree").visit(function(node){
      node.setSelected(false);
    });
    return false;
  });

  $("button#uncheckTarget").click(function(){
    $("#targettree").fancytree("getTree").visit(function(node){
      node.setSelected(false);
    });
    return false;
  });

  $("button#collapseSource").click(function(){
    $("#sourcetree").fancytree("getTree").visit(function(node){
      node.setExpanded(false);
    });
    return false;
  });

  $("button#collapseTarget").click(function(){
    $("#targettree").fancytree("getTree").visit(function(node){
      node.setExpanded(false);
    });
    return false;
  });

  $("button#expandSource").click(function(){
    $("#sourcetree").fancytree("getTree").visit(function(node){
      node.setExpanded(true);
    });
    return false;
  });

  $("button#expandTarget").click(function(){
    $("#targettree").fancytree("getTree").visit(function(node){
      node.setExpanded(true);
    });
    return false;
  }); 

  $(document).on( 'click', '#infoSource', function() {
    var tree = $("#sourcetree").fancytree("getTree");
    loadInfoModal(tree);
  });

  $(document).on( 'click', '#infoTarget', function() {
    var tree = $("#targettree").fancytree("getTree");
    loadInfoModal(tree);
  });


});