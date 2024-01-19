let pageCount = 0,
  currentPage = 1,
  per_page = 10,
  repoCount = 0,
  justLoaded = true,
  prefix = "";

let repositories = [];

const username = "johnpapa";

const searchText = document.getElementById("search-text");
const searchBtn = document.getElementById("search-button");

// Track input text and set prefix
searchBtn.addEventListener("click", () => {
  prefix = searchText.value;
  bindData();
});

const countRepos = async (username) => {
  const url = `https://api.github.com/users/${username}`;
  const resp = await fetch(url);
  const data = await resp.json();
  addUserDetails(data);
  return data.public_repos;
};

const addUserDetails = (data) => {
  const image = document.getElementById("image");
  const github = document.getElementById("github");
  const name = document.getElementById("name");
  const bio = document.getElementById("bio");
  const location = document.getElementById("location");
  const twitter = document.getElementById("twitter");

  image.src = data.avatar_url;
  github.href = github.innerHTML = data.html_url;
  name.innerHTML = data.name;
  bio.innerHTML = data.bio;
  location.innerHTML = data.location;
  twitter.href =
    twitter.innerHTML = `https://twitter.com/${data.twitter_username}`;
};

const fetchRepositories = async () => {
  if (!repoCount) repoCount = await countRepos(username);
  buildPagination();

  const url = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${per_page}`;
  const resp = await fetch(url);
  repositories = await resp.json();
  bindData(repositories);

  document.getElementById(currentPage).classList.add("active");
};

const bindData = () => {
  const cardsContainer = document.getElementById("cards-container");
  const repoCardTemplate = document.getElementById("template-repo-card");

  cardsContainer.innerHTML = "";

  repositories.forEach((repo) => {
    if (!repo.name.startsWith(prefix)) return;
    const cardClone = repoCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, repo);
    cardsContainer.appendChild(cardClone);
  });
};

const fillDataInCard = (cardClone, repo) => {
  const repoTitle = cardClone.getElementById("repo-title");
  const repoDesc = cardClone.getElementById("repo-desc");
  const repoTopics = cardClone.getElementById("repo-topics");

  repoTitle.innerHTML = repo.name || "No title";
  repoDesc.innerHTML = repo.description || "No description";

  repo.topics.forEach((topic) => {
    const node = document.createElement("li");
    node.setAttribute("class", "topic");
    node.innerHTML = topic;
    repoTopics.appendChild(node);
  });
};

const buildPagination = () => {
  const newPageCount =
    Math.floor(repoCount / per_page) + (repoCount % per_page > 0);
  pageCount = newPageCount;
  currentPage = Math.min(currentPage, pageCount);

  let pages = [];
  let left = [1, 0];
  let right = [0, pageCount];

  if (pageCount <= 9) {
    pages = buildArray(pageCount, 1);
  } else if (currentPage < 7) {
    const currentArray = buildArray(7, 1);
    pages = currentArray.concat(right);
  } else if (currentPage > pageCount - 6) {
    const currentArray = buildArray(7, pageCount - 6);
    pages = left.concat(currentArray);
  } else {
    const currentArray = buildArray(5, currentPage - 2);
    left = left.concat(currentArray);
    pages = left.concat(right);
  }

  const btnContainer = document.getElementById("btn-container");
  if (btnContainer) btnContainer.remove();

  const list = document.createElement("div");
  list.setAttribute("id", "btn-container");
  pages.forEach((page) => {
    const val = page ? page : "...";
    const node = document.createElement("button");
    node.innerHTML = val;
    if (val !== "...") {
      node.setAttribute("class", "btn");
      node.setAttribute("id", val);
      if (justLoaded) {
        node.classList.add("active");
        justLoaded = false;
      }
      node.setAttribute("onclick", `changeCurrentPage(${val})`);
    } else {
      node.setAttribute("class", "space");
    }
    list.appendChild(node);
  });

  const prevButton = document.getElementById("prev-button");
  prevButton.insertAdjacentElement("afterend", list);
};

const changeCurrentPage = (val) => {
  let prevPage;
  if (val === currentPage) return;
  if (val === "prev") {
    if (currentPage === 1) return;
    prevPage = currentPage;
    currentPage--;
  } else if (val === "next") {
    if (currentPage === pageCount) return;
    prevPage = currentPage;
    currentPage++;
  } else {
    prevPage = currentPage;
    currentPage = val;
  }

  document.getElementById(prevPage).classList.remove("active");
  fetchRepositories();
};

const buildArray = (len, start) =>
  Array.from({ length: len }, (_, i) => i + start);

const reposPerPage = document.getElementById("repos-per-page");

// Handle change in number of repositories per page
reposPerPage.addEventListener("change", (e) => {
  per_page = e.target.value;
  fetchRepositories();
});

window.addEventListener("load", fetchRepositories);
