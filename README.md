# The Science behind Song Popularity: Audio Insights

Music engages various senses in the human body, with audio playing a pivotal role in this experience. The song audio not only influences human emotions but also play a significant role in determining the success of a song. While previous research has explored predicting a song's success using trained models on low-level and high-level audio features, this work takes a more comprehensive approach. We aim to provide a holistic perspective by developing a visualization system that enables music artists and composers to explore trends, correlations between audio features, and gain valuable insights. In this work, we leverage both low-level and high-level audio features for our visualization system. We focused on analyzing the Billboard Top 100 songs from each year over the past decade. The low-level data for these songs was retrieved from AcousticBrainz, while the high-level data was obtained using the Spotify API. Our findings will help artists to look at these trends and either conform to them to make hit songs, or break the mold like other anomalous artists have done so while still making a popular song. The various features like acousticness, loudness, energy, danceability etc. prove to be metrics that trend with each year, thereby producers or artists can figure out how they are trending and predict with a certain confidence that a certain type of song might work, without having to rely wholly on intuition. The dataset creation scripts are in another [repo](https://github.com/AayushG159/spotify-aa-dataset). 

## Pre-requisites
Make sure you have the latest Angular CLI installed on your system. Refer official [docs](https://angular.dev/installation) for steps

## Installation
To install all required packages, navigate to the project folder and run:
```bash
npm install
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server runs, open your browser and navigate to `http://localhost:4200/`. 
