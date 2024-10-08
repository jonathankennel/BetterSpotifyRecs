const clientId = "0f090d6e10ab49fbbb525fb6c23c9fa4"; // from dashboard
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

// a few global variables
var displayed = "";
let trueuriString = "";
let seedString = "";
let truepopString ="";

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const tracksShort = await fetchTopTracks(accessToken, "short_term", 50);
    const artistsShort = await fetchTopArtists(accessToken, "short_term", 50);
    const tracksMed = await fetchTopTracks(accessToken, "medium_term", 50);
    const artistsMed = await fetchTopArtists(accessToken, "medium_term", 50);
    const tracksLong = await fetchTopTracks(accessToken, "long_term", 50);
    const artistsLong = await fetchTopArtists(accessToken, "long_term", 50);
    listProfile(profile);
    drawButtons(accessToken, tracksShort, artistsShort, tracksMed, artistsMed, tracksLong, artistsLong, profile);
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-top-read playlist-modify-public");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
    
}

async function fetchRecommendations(token, trackString, artistString, popString) {
    if (trackString.length == 0) {
        const result = await fetch("https://api.spotify.com/v1/recommendations?limit=50&seed_artists=" + artistString + popString, { 
            method: "GET", headers: { Authorization: `Bearer ${token}` }
        });
        const recs = await result.json();
        if (result.status == 429) {
            alert("The app has temporarily exceeded rate limits. Please try again at another time");
            return null;
        }
        else if (result.status == 200) {
            return recs.tracks;
        }
        else {
            alert("The app has run into an unexpected error while listing recommendations");
            return null;
        }
    }
    else if (artistString.length == 0) {
        const result = await fetch("https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=" + trackString + popString, { 
            method: "GET", headers: { Authorization: `Bearer ${token}` }
        });
        const recs = await result.json();
        if (result.status == 429) {
            alert("The app has temporarily exceeded rate limits. Please try again at another time");
            return null;
        }
        else if (result.status == 200) {
            return recs.tracks;
        }
        else {
            alert("The app has run into an unexpected error while listing recommendations");
            return null;
        }
    }
    else {
        const result = await fetch("https://api.spotify.com/v1/recommendations?limit=50&seed_artists=" + artistString + "&seed_tracks=" + trackString + popString, { 
            method: "GET", headers: { Authorization: `Bearer ${token}` }
        });
        const recs = await result.json();
        if (result.status == 429) {
            alert("The app has temporarily exceeded rate limits. Please try again at another time");
            return null;
        }
        else if (result.status == 200) {
            return recs.tracks;
        }
        else {
            alert("The app has run into an unexpected error while listing recommendations");
            return null;
        }
    }
}

async function listRecommendations(token, trackSeeds, artistSeeds, profile) {
    const popularity = document.getElementById('popularity').value;
    truepopString = "";
    let popString = "";
    // 3 different checks because im deathly afraid of text boxes
    if (!isNaN(popularity)) {
        if (popularity != "") {
            if (popularity <= 100 && popularity >= 0) {
                popString = "&target_popularity=" + popularity;
                truepopString = popularity;
            }
        } 
    }
    var artistString = "";
    var trackString = "";
    if (artistSeeds.length > 0) {
        artistSeeds.forEach(element => {
            artistString = artistString + element.id + "%2C";
        });
        artistString = artistString.substring(0, artistString.length - 3);
    }
    if (trackSeeds.length > 0) {
        trackSeeds.forEach(element => {
            trackString = trackString + element.id + "%2C";
        });
        trackString = trackString.substring(0, trackString.length - 3);
    }
    const recs = await fetchRecommendations(token, trackString, artistString, popString);
    if (recs != null) {
        clearLists();
        scroll(0,0);
        document.getElementById("recTitle").innerText = "Recommended Tracks";
        let list = document.getElementById("recList");
        let uriString = "";
        let uriStringTemp = "";
        // putting all recommendations into a single var in api friendly format
        recs.forEach((item) => {
            let li = document.createElement("li");
            li.innerText = " — " + item.artists[0].name;
            let a = document.createElement('a'),
            linkText = document.createTextNode(item.name);
            a.href = item.external_urls.spotify;
            a.appendChild(linkText);
            li.prepend(a);
            list.appendChild(li);
            uriStringTemp = item.uri;
            uriStringTemp = uriStringTemp.substring(14, uriStringTemp.length)
            uriStringTemp = "spotify%3Atrack%3A" + uriStringTemp + "%2C";
            uriString = uriString + uriStringTemp;
        });
        uriString = uriString.substring(0, uriString.length - 3);
        hideTopText();
        document.getElementById('shortBtn').style.display = "none";
        document.getElementById('medBtn').style.display = "none";
        document.getElementById('longBtn').style.display = "none";
        const playlistButton = document.getElementById('playlistBtn');
        trueuriString = uriString;
        if (playlistButton.innerText != "Create Playlist") {
            playlistButton.addEventListener('click', function(){handlePlaylist(token, profile, trueuriString)});
        }
        playlistButton.innerText = "Create Playlist";
        playlistButton.style.display = "inline-block";
    }
}

async function handlePlaylist(token, profile, uriString) {
    //console.log(seedString);
    // handles bodyString for api call so description of playlist can be modified based on whether or not popularity was used
    let bodyString = ""
    if (truepopString == "") {
        bodyString = JSON.stringify({name: "BetterSpotifyRecs", public: true, 
            description: "track and/or artist seeds used for this playlist: " + seedString + " — https://github.com/jonathankennel/BetterSpotifyRecs"})
    }
    else {
        bodyString = JSON.stringify({name: "BetterSpotifyRecs", public: true, 
            description: "track and/or artist seeds used for this playlist: " + seedString + " — with a desired popularity of " + truepopString + " — https://github.com/jonathankennel/BetterSpotifyRecs — "})
    }
    const result = await fetch("https://api.spotify.com/v1/users/" + profile.id + "/playlists", { 
        method: "POST",
        body: bodyString,
        headers: 
        { 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' }
    });
    if (result.status == 201) {
        const playlist = await result.json();
        const result2 = await fetch("https://api.spotify.com/v1/playlists/" + playlist.id + "/tracks?uris=" + uriString, { 
        method: "POST",
        headers: 
        { 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' }
    });

    // Showing confirmation that playlist is created and giving link
    const playlistText = document.getElementById('createdPlaylist');
    if (result2.status == 201) {
        playlistText.innerText = "Playlist successfully created. Playlist is accessible at: ";
        let a = document.createElement('a');
        let linkText = document.createTextNode(playlist.external_urls.spotify);
        a.href = playlist.external_urls.spotify;
        a.appendChild(linkText);
        playlistText.appendChild(a);
        //alert("Playlist successfully created. Playlist is accessible at: " + playlist.external_urls.spotify);
    }
    else if (result2.status == 429) {
        alert("The app has temporarily exceeded rate limits. Please try again at another time");
    }
    else {
        playlistText.innerText = "Error when adding songs to playlist. Playlist is accessible at: ";
        let a = document.createElement('a');
        let linkText = document.createTextNode(playlist.external_urls.spotify);
        a.href = playlist.external_urls.spotify;
        a.appendChild(linkText);
        playlistText.appendChild(a);
        //alert("Error when adding songs to playlist. Link to playlist: " + playlist.external_urls.spotify)
    }
    }
    if (result.status == 429) {
        alert("The app has temporarily exceeded rate limits. Please try again at another time");
    }
    else {
        playlistText = "Error when creating playlist! Please refresh the page and try again."
    }

}

async function fetchTopTracks(token, time, limit) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=" + limit + "&time_range=" + time, { 
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const trackz = await result.json();
    return trackz.items;
}

async function fetchTopArtists(token, time, limit) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?limit=" + limit + "&time_range=" + time, { 
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const artistz = await result.json();
    return artistz.items;
}

function drawButtons(token, tracksShort, artistsShort, tracksMed, artistsMed, tracksLong, artistsLong, profile) {
    const shortButton = document.getElementById('shortBtn');
    shortButton.addEventListener('click', function(){listBoth(artistsShort, tracksShort, "short")});
    shortButton.innerText = "Short Term"
    const medButton = document.getElementById('medBtn');
    medButton.addEventListener('click', function(){listBoth(artistsMed, tracksMed, "med")});
    medButton.innerText = "Medium Term"
    const longButton = document.getElementById('longBtn');
    longButton.addEventListener('click', function(){listBoth(artistsLong, tracksLong, "long")});
    longButton.innerText = "Long Term"

    const submitButton = document.getElementById('submitBtn');
    submitButton.innerText = "Give Recommendations";
    submitButton.addEventListener('click', function(){handleRecommendations(token, tracksShort, artistsShort, tracksMed, artistsMed, tracksLong, artistsLong, profile)});
    submitButton.style.display = "none";

    const returnButton = document.getElementById('returnBtn');
    returnButton.innerText = "Return to Start";
    returnButton.addEventListener('click', function(){handleReturn()});
    returnButton.style.display = "none";
}

function listProfile(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
    }
    writeInstructions();
    document.getElementById('popularity').style.display = "none";
    document.getElementById('playlistBtn').style.display = "none";
}

function listBoth(artists, tracks, type) {
    clearLists();
    displayType(type);
    displayTopText();
    listArtists(artists);
    listTracks(tracks);
}

function displayTopText() {
    document.getElementById('topTracks').innerText = "Top Tracks";
    document.getElementById('topArtists').innerText = "Top Artists";
    document.getElementById('submitBtn').style.display = "inline-block";
    document.getElementById('popularity').style.display = "inline-block";
    document.getElementById("popularityInstructions").innerText = "(OPTIONAL) Input a number 0-100 for the desired popularity of given recommendations, with 100 being the most popular"
}

function hideTopText() {
    document.getElementById('topTracks').innerHTML = "";
    document.getElementById('topArtists').innerHTML = "";
    document.getElementById('instructions').innerHTML = "";
    document.getElementById('popularityInstructions').innerHTML = "";
    document.getElementById('submitBtn').style.display = "none";
    document.getElementById('returnBtn').style.display = "inline-block";
    document.getElementById('popularity').value = "";
    document.getElementById('popularity').style.display = "none";
}

function writeInstructions() {
    document.getElementById("instructions").innerText = "Please select between 1-5 combined artists and/or tracks from your short, medium, or long term listening history to generate recommendations";
}

function handleReturn() {
    clearLists();
    document.getElementById('shortBtn').style.display = "inline-block";
    document.getElementById('medBtn').style.display = "inline-block";
    document.getElementById('longBtn').style.display = "inline-block";
    document.getElementById('returnBtn').style.display = "none";
    document.getElementById('playlistBtn').style.display = "none";
    document.getElementById("recTitle").innerHTML = "";
    document.getElementById("createdPlaylist").innerHTML = "";
    writeInstructions();
}

function displayType(type) {
    if (type == "short") {
        document.getElementById('type').innerText = "Displaying listening history over approximately the past 4 weeks";
        displayed = "short";
    }
    else if (type == "med") {
        document.getElementById('type').innerText = "Displaying listening history over approximately the past 6 months";
        displayed = "med";
    }
    else if (type =="long") {
        document.getElementById('type').innerText = "Displaying listening history over approximately the past 1-2 years";
        displayed = "long";
    }
}

function clearLists() {
    document.getElementById("artistlist").innerHTML = "";
    document.getElementById("tracklist").innerHTML = "";
    document.getElementById("type").innerHTML = "";
    document.getElementById("recList").innerHTML = "";
}


function handleRecommendations(token, tracksShort, artistsShort, tracksMed, artistsMed, tracksLong, artistsLong, profile) {
    const trackSeeds = [];
    const artistSeeds = [];
    seedString = "";
    if (displayed == "") {
        alert("Please click either Short Term, Medium Term, or Long Term and select items to generate recommendations");
    }
    else if (displayed == "short") {
        artistsShort.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                artistSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        tracksShort.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                trackSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        seedString = seedString.substring(0, seedString.length - 2);
    }
    else if (displayed == "med") {
        artistsMed.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                artistSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        tracksMed.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                trackSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        seedString = seedString.substring(0, seedString.length - 2);
    }
    else if (displayed == "long") {
        artistsLong.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                artistSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        tracksLong.forEach((item) => {
            if (document.getElementById(item.id).checked) {
                trackSeeds.push(item);
                seedString = seedString + item.name + ", ";
            }
        });
        seedString = seedString.substring(0, seedString.length - 2);
    }
    else {
        alert("Unexpected Error while tallying seeds for recommendation. Please return to localhost and try again");
    }
    if ((trackSeeds.length + artistSeeds.length) > 5) {
        alert("Please select at least one but no more than 5 combined artists and/or tracks");
    }
    else if ((trackSeeds.length + artistSeeds.length) == 0) {
        alert("Please select at least one but no more than 5 combined artists and/or tracks");
    }
    else {
        listRecommendations(token, trackSeeds, artistSeeds, profile);
    }

}

function listArtists(artists) {
    let list = document.getElementById("artistlist");
    artists.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item.name;
        let x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.setAttribute("name", "x");
        x.setAttribute("value", item.id);
        x.setAttribute("id", item.id);
        li.appendChild(x);
        list.appendChild(li);
    });
}

function listTracks(tracks) {
    let list = document.getElementById("tracklist");
    tracks.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item.name + " — " + item.artists[0].name;
        let x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.setAttribute("name", "x");
        x.setAttribute("value", item.id);
        x.setAttribute("id", item.id);
        li.appendChild(x);
        list.appendChild(li);
    });
}