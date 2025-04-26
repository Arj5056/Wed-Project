"use strict";

// This function will run when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Get article ID from the container element
  const articleId = document.querySelector('.comment-container').getAttribute('data-article-id');
  
  const userId = {
    name: null,
    identity: null,
    image: null,
    message: null,
    date: null,
  };

  const userComment = document.querySelector(".usercomment");
  const publish = document.querySelector("#publish"); 
  const comments = document.querySelector(".comments");
  const userName = document.querySelector(".user");

  userComment.addEventListener("input", (e) => {
    if (!userComment.value) {
      publish.setAttribute("disabled", "disabled");
      publish.classList.remove("abled");
    } else {
      publish.removeAttribute("disabled");
      publish.classList.add("abled");
    }
  });

  function addPost() {
    if (!userComment.value) return;

    userId.name = userName.value || "anonymous";
    if (userId.name === "anonymous") {
      userId.identity = false;
      userId.image = "img/anonymous.png"; 
    } else {
      userId.identity = true;
      userId.image = "img/userphoto.png"; 
    }

    userId.message = userComment.value;
    userId.date = new Date().toLocaleString();

    let publish = `<div class="parentsa">
        <img src="${userId.image}">
        <div>
        <h1>${userId.name}</h1>
        <p>${userId.message}</p>
        </div>
        <span class="date">${userId.date}</span>
        </div>
      </div>`;

    comments.innerHTML += publish;
    // Store comments specific to this article using the article ID
    localStorage.setItem("comments_" + articleId, comments.innerHTML);

    userComment.value = "";
    let commentsNum = document.querySelectorAll(".parentsa").length;
    document.getElementById("comment").textContent = commentsNum;
  }

  publish.addEventListener("click", addPost);
  
  // Load saved comments
  const savedComments = localStorage.getItem("comments_" + articleId);
  if (savedComments) {
    comments.innerHTML = savedComments;
  }

  let commentsNum = document.querySelectorAll(".parentsa").length;
  document.getElementById("comment").textContent = commentsNum;
});