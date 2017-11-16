Date.prototype.getUnixTime = function() { return this.getTime() };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }

let happeningSoon = document.querySelector("#happeningSoon");
happeningSoon.addEventListener("click", function(){
    let events = document.querySelectorAll(".event");
    let date = Date.now();


    events.forEach(e=>{

        let difference = e.dataset.timestamp - date;
        let daysToEvent = difference/1000/86400;
        if(daysToEvent < 0 || daysToEvent > 7){
            e.classList.add("hidden")
        }
    })
})


function removeOldEvents(){
    let events = document.querySelectorAll(".event");
    let date = Date.now();


    events.forEach(e=>{

        let difference = e.dataset.timestamp - date;
        let daysToEvent = difference/1000/86400;
        if(daysToEvent < 0){
            e.classList.add("hidden")
        }
    })
}



function getData() {
    fetch("http://bbmedia.dk/mywpsite/wp-json/wp/v2/events?_embed&per_page=11").then(res => res.json()).then(showEvents);
}

function getAllEventsByTag(id) {
    fetch("http://bbmedia.dk/mywpsite/wp-json/wp/v2/events?_embed&tags=" + id).then(res => res.json()).then(showEvents);
}

/*read more button*/

function getSingleEventById(myId){
	//console.log(myId);
	fetch("http://bbmedia.dk/mywpsite/wp-json/wp/v2/events/"+myId+"/?_embed").then(res => res.json()).then(showSingleEvent);
}

function showSingleEvent(json){
	console.log(json);
	document.querySelector("#single h1").textContent=json.title.rendered;
	document.querySelector("#single .price span").textContent=json.acf.price;
	document.querySelector("#single .read-more").textContent=json.content.rendered;
	document.querySelector("#single .thumbnail").setAttribute("src",json._embedded["wp:featuredmedia"][0].media_details.sizes.thumbnail.source_url);
}



function getMenu() {
    fetch("http://bbmedia.dk/mywpsite/wp-json/wp/v2/tags")
        .then(e => e.json())
        .then(showMenu)
}

function showMenu(tags) {
    console.log(tags);
    let lt = document.querySelector("#linkTemplate").content;

    tags.forEach(function (tag) {
        if (tag.count > 0) {


            let clone = lt.cloneNode(true);
            let parent = document.querySelector("#tagmenu");
            clone.querySelector("a").textContent = tag.name;
            clone.querySelector("a").setAttribute("href", "events_page.html?tagid=" + tag.id);

            parent.appendChild(clone);
        }
    });

}

function showEvents(data) {
    //console.log(data)
    let list = document.querySelector("#list");
    let template = document.querySelector("#eventTemplate").content;
    data.sort(function (a, b) {
      return a.acf.date > b.acf.date;
    });

    data.forEach(function (theEvent) {
        let clone = template.cloneNode(true);
        let title = clone.querySelector("h1");
        let genre = clone.querySelector("h2");
        let excerpt = clone.querySelector(".excerpt");
        let price = clone.querySelector(".price");
        let img = clone.querySelector("img");
        let link2 = clone.querySelector ("a.read-more")
        title.textContent = theEvent.title.rendered;
        genre.textContent = theEvent.acf.genre;
        let date = clone.querySelector(".date span");
        let time = clone.querySelector(".time");
        let restaurant = clone.querySelector(".restaurant");
        let link = clone.querySelector(".category");
        let facebook = clone.querySelector(".facebook");
        let instagram = clone.querySelector(".instagram");
		let stage = clone.querySelector(".stage");

        if(theEvent.excerpt){
            excerpt.innerHTML = theEvent.excerpt.rendered;
        }
		stage.textContent = theEvent.acf.stage;
        price.textContent = "Price: " + theEvent.acf.price + " kr.";
        time.textContent = theEvent.acf.time;
        restaurant.textContent = "Restaurant open: " + theEvent.acf.restaurant;
        link.href = theEvent.acf.link;
        facebook.href = theEvent.acf.facebook;
        instagram.href = theEvent.acf.instagram;
        //console.log(theEvent._embedded["wp:featuredmedia"][0].media_details.sizes)
        let nd=theEvent.acf.date;
        let y = nd.substring(0, 4);
        let m = nd.substring(4, 6);
        let d = nd.substring(6,8);
        let ts = new Date(y, m-1, d);
        //console.log(ts.getUnixTime())
        clone.querySelector("article").dataset.timestamp=ts.getUnixTime()
        date.textContent = y +"-"+ m +"-"+ d;

        if (theEvent.featured_media != 0) {
            img.setAttribute("src", theEvent._embedded["wp:featuredmedia"][0].media_details.sizes.thumbnail.source_url)
        }

/*read more button*/
        link2.setAttribute("href", "event.html?id="+theEvent.id);

        list.appendChild(clone);
    })
    removeOldEvents()
}
let searchParams = new URLSearchParams(window.location.search);
let id = searchParams.get("id");
let tagid = searchParams.get("tagid");


getMenu();

if (tagid) {
    getAllEventsByTag(tagid);

}
else if(id){getSingleEventById(id)}
else {
    getData();
}
