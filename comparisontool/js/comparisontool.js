/* Page object fields */

var options = {
  valueNames: [ 'label', 'url', 'name' ]
};


/* Initialize object containing all pages */
var userList = new List('users', options);


/* Generates images dynamically */
function makeImage(length) {
      // turns text-based picture id data into an <img>
      var link = $(document.body).find("li").find("a.url");      
      console.log(link);
      link.each(function() {
          cleanlinkid = $(this).text().replace(/\s/g,'');
          if (cleanlinkid !== '') {
            $(this).empty();
            $(this).add("<img src = 'http://ids.lib.harvard.edu/ids/view/"+cleanlinkid+"'/>").appendTo( $(this));
          }
      });

      // Makes images appear if hidden
      var visibleImages = $(document.body).find("ul.list").find("li");      
      visibleImages.each(function() {
        $(this).css("display","block");  
      });

      // Remove helper and add load message
      helpbox = $(document.body).find("div.helper");
      helpbox.empty();
      helpbox.add('<p class="help-message">Pages may take some seconds to load</p>').appendTo(helpbox);

      // No match
      if (length === 0){
        console.log("length = 0!!!!!!!!!!!!!!!!!");
        helpbox.empty();
        helpbox.add('<p class="help-message">There are no pages that meet your search. Please try another search or click a button.</p>').appendTo(helpbox);
      }


}

/* Prevents user from loading too many images at once and crashing the browser */
function hideImage() {
      // hides images thumbnails
      var visibleImages = $(document.body).find("ul.list").find("li");
      visibleImages.each(function() {
          $(this).css("display","none");
      });

      // update message to guide user to narrow their search
      helpbox = $(document.body).find("div.helper");
      helpbox.empty();
      helpbox.add('<p class="help-message">Too many results. Please specify your search or click a button.</p>').appendTo(helpbox);


}


/* Causes button clicks to update the search box */

$( "button" ).click(function() {
  var text = $( this ).text();
  $( "input.search" ).val( text ).keyup();
$(function() {
    $('input.search').keydown();
    $('input.search').keypress();
    $('input.search').keyup();
    $('input.search').blur();
});});

