$( document ).ready(function(){
  $("#login").click( function(){
    $("#registerForm").addClass("hidden");
    $("#loginForm").removeClass("hidden");
  });
  $("#register").click( function(){
    $("#loginForm").addClass("hidden");
    $("#registerForm").removeClass("hidden");
  });
});
