# BetterSpotifyRecs
Unique and improved Spotify recommendations based on selectable tracks/artists from your top tracks/artists and an optional desired popularity. Allows recommendations to be exported directly to a new spotify playlist with the click of a button. 

javascript based app using node.js and npm

# IMPORTANT NOTE:
AS OF NOVEMBER 27, 2024, SPOTIFY HAS DEPRECATED THE "Get Recommendations" ENDPOINT, MAKING THIS APPLICATION MOSTLY UNUSABLE

https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api

[blog post with a bunch of comments from frustrated developers similar to myself](https://community.spotify.com/t5/Spotify-for-Developers/Changes-to-Web-API/td-p/6540414)

[documentation of the specific endpoint which has been deprecated](https://developer.spotify.com/documentation/web-api/reference/get-recommendations)


### Note to potential employers:
I unfortunately did not make a demonstration video of my application in action, I have since been in contact with Spotify hoping to extend usage of this endpoint for this specific project, or even just extending it long enough to film a video showcasing all of the functionality. In the event that this takes a long time or never happens, I will describe the functionality of my project, as none of the code has changed.

### Functionality:

Note:
all functionality prior to pressing the "Give Recommendations" button works perfectly, but I will describe it nonetheless.

Upon starting up the application and going to localhost:5173 in the browser, the user is prompted to log in to their spotify account. Upon logging in, the user's username and profile picture are displayed along with an instructional phrase "Please select between 1-5 combined artists and/or tracks from your short, medium, or long term listening history to generate recommendations" and 3 buttons titled "Short Term" "Medium Term" and "Long Term." Clicking each of these buttons will display up to the top 50 most listened to artists and tracks of the user for their respective time frame, roughly 4 weeks, 6 months, and 1-2 years respectively. These numbered lists also include checkboxes that are used to select the seed values for the Get Recommendations API call. The user will also see an additional line stating "(OPTIONAL) Input a number 0-100 for the desired popularity of given recommendations, with 100 being the most popular," alongside a number box, and a "Give Recommendations" button. If the user does not put in a number or puts in a number outside of the range 0-100(inclusive), popularity will not be used as a metric for track recommendations. Otherwise, the desired popularity will be passed on to the Get Recommendations endpoint alongside the user's selected artists/tracks upon clicking the "Give Recommendations" button. There is no limit to the number of tracks able to be selected, but pressing the "Give Recommendations" button without selecting 1-5(inclusive) tracks/artists will alert the user informing them to "Please select at least one but no more than 5 combined artists and/or tracks." 

Upon pressing the "Give Recommendations" button with valid selections, the page will update, instead showcasing 2 buttons titled "Create Playlist" and "Return to Start" and a numbered list with up to 50 tracks and their artists. This list is composed entirely of clickable links, where when you click on the title of a track, it will bring you to the spotify page for that song eg:(https://open.spotify.com/track/4z1fNs2B7KndCsvyPgrhq5). Upon clicking on the "Create Playlist" button, a public playlist of all of the recommended tracks will automatically be created upon the user's behalf with a custom description (EXAMPLES SHOWN IN LINKS BELOW). A text box will also appear informing the user "Playlist successfully created. Playlist is accessible at: " followed by a link to the newly created playlist. Upon clicking the "Create Playlist" button again, a second playlist will not be created, as to prevent accidently making multiple of the same playlist. If the user would like to create more playlists, they may press the "Return to Start" button, which takes the user back to how the page appeared after logging in, but without the need to log in again.

After extensive testing, there are no known bugs for this application (excluding the fact that spotify made it unusable). Additionally, there are error messages for when there are errors getting recommendations or creating a playlist. Due to the way this was implemented and having not predicted the Get Recommendations endpoint to be entirely deprecated, the error messages for get recommendations do not appear if you use the application in its current state.


#### Links to playlists created by BetterSpotifyRecs, to get an idea of what the final product looked like given different seeds:

[Artist only](https://open.spotify.com/playlist/2eWJ2qaAfaLesfscDmQJmk?si=af1adbf9420b4c09)

[Artist + Popularity](https://open.spotify.com/playlist/6tejlgrZ6juxE5Be9XLGD1?si=05b7aca7f3924150)

[Artists + Track + Popularity](https://open.spotify.com/playlist/2aOuqJq1ul1T6ngowbsrOY?si=2cf34645bf2b4796)


### INSTALLATION/USE GUIDE:
1. clone this repo
2. open cmd in cloned folder
3. run "npm install"
4. run "npm run dev"
5. open localhost:5173 in your browser and enjoy :)

after inital installation, only steps 2, 4, 5 need to be done to open app.
