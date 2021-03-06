/*
img.gh {
  border-radius: 5px 5px 0 0;
  width: 100%;
//clip-path: polygon(100% 0, 100% 95%, 50% 100%, 0% 95%, 0 0);
}
*/

let cards = document.getElementsByClassName('gh-card');

function injectStyle(str) {
    let node = document.createElement('style');
    node.innerHTML = str;
    document.body.appendChild(node);
}

function injectStylesheet(url) {
  let node = document.createElement('link');
  node.setAttribute('rel', 'stylesheet');
  node.setAttribute('href', url);
  document.body.appendChild(node);
}

let style = `
.gh h4 {
  padding: 0;
  margin: 0;
}

.gh a, .gh a:visited {
  text-decoration: none;
  color: black;
}

.gh-small {
  zoom: 0.5;
}

.gh-medium {
  zoom: 0.75;
}

.gh-large {
  zoom: 1;
}
.gh-card {
    font-family: 'Arial';
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
    width: 80%;
    text-align: center;
    display: block;
    margin-left: auto;
    margin-right: auto;
    @include mobile {
      width: 90%;
    }
    display: inline-block;
    color: #606060;
  margin-top: 30px;
  margin-bottom: 30px;
  border-radius: 5px;
}

.gh-card:hover {
    box-shadow: 0 16px 32px 0 rgba(0,0,0,0.2);
}

img.gh {
  border-radius: 5px 5px 0 0;
    position: absolute;
    left: -1000%;
    right: -1000%;
    top: -1000%;
    bottom: -1000%;
    margin: auto;
    min-height: 100%;
    min-width: 100%;
//clip-path: polygon(100% 0, 100% 95%, 50% 100%, 0% 95%, 0 0);
}

.imgcontainer{
    height: 250px;
    overflow: hidden;
    position: relative;
}

.container.gh {
  padding: 16px;
}

.gh p {
  line-height: 1.6;
  margin: 1em 0;
}

`;

injectStylesheet('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
injectStyle(style);

function send_card_inner_html(card, json, title, description) {
    if (description==null){
      description=json.description;
    }

    if (title==null){
      title=json.name;
    }

    card.innerHTML = `
      <div class="imgcontainer">
        <img class="gh" src="${card.getAttribute('data-image') || json.avatar_url}">
      </div>
      <div class="gh container">
        <h4 class="gh">
          <a class="gh" href="${json.html_url}">
            ${title}
          </a>
        </h4>
        <p class="gh">${description}</p>
<!--    <a class="gh" href="${json.html_url}">
          <i class="fa fa-fw fa-code" aria-hidden="true"></i> ${json.language}
          <i class="fa fa-fw" aria-hidden="true"></i>
        </a>
        <a class="gh" href="${json.html_url}">
          <i class="fa fa-fw fa-star" aria-hidden="true"></i> ${json.stargazers_count}
          <i class="fa fa-fw" aria-hidden="true"></i>
        </a>
        <a class="gh" href="${json.html_url}">
          <i class="fa fa-fw fa-code-fork" aria-hidden="true"></i> ${json.forks_count}
        </a>             -->

      </div>
    `;
}


for(let card of cards) {
  let repo = card.getAttribute('data-repo');
  let description = card.getAttribute('data-description');
  let title = card.getAttribute('data-title');
  let url = 'https://api.github.com/repos/' + repo;

  let cookie_json = Cookies.get(repo);

  if (cookie_json == null)
  {
    console.log("Fetch data from GitHub");

    fetch(url, {method: 'GET'}).then(resp => {
       return resp.json();
    }).then(json => {

    mini_json = {};
    mini_json.html_url = json.html_url;
    mini_json.name = json.name;
    mini_json.language = json.language;
    mini_json.stargazers_count = json.stargazers_count;
    mini_json.forks_count = json.forks_count;
    mini_json.description = json.description;
    mini_json.avatar_url = json.owner.avatar_url;
    

    Cookies.set(repo, JSON.stringify(mini_json), { expires: 1 });

    send_card_inner_html(card, mini_json, title, description);
      
    }).catch(err => {
      console.log(err);
    });
  }
  else
  {
    console.log("Get data from cache");

    json = JSON.parse(cookie_json);
    mini_json = {};
    mini_json.html_url = json.html_url;
    mini_json.name = json.name;
    mini_json.language = json.language;
    mini_json.stargazers_count = json.stargazers_count;
    mini_json.forks_count = json.forks_count;
    mini_json.description = json.description;
    mini_json.avatar_url = json.avatar_url;

    send_card_inner_html(card, mini_json, title, description);
  }


}
