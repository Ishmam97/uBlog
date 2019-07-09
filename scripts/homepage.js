$( document ).ready( function( ) {
 //fill hot posts
   //TO DO : algorithm for picking posts and inserting

 for( i = 0; i<$('.page .box').length ; ++i){
   $('.box:eq('+i+')').css({"background":"url(./res/ryan-cheng-1435665-unsplash.jpg)","background-size":"cover"});
 }

// add code for filling events and NEWSFEED
// box Animation
   //clicking on post
$('.box').click(function(){

$('.selected-post').removeClass('hidden');
$('.overlay').removeClass('hidden');
});
  // closing pop up
$('#x').click(function(){
  $('.selected-post').addClass('hidden');
  $('.overlay').addClass('hidden');
});
$('.overlay').click(function(){
  $('.selected-post').addClass('hidden');
  $('.overlay').addClass('hidden');
});

});
