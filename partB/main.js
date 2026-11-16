/*
	Joel Al Gohri Sayed
	W0514987
	PROG2700 - Assignment 3, Part B: Map, Filter, and Reduce (Friends)
*/

// IIFE
(() => {

	//Choose an array method to implement for each of the incomplete functions.
	//FOR/WHILE LOOPS OF ANY KIND ARE FORBIDDEN! You must use the available array functions to accomplish your goal.

	//Remember, you can chain together array function calls to attain your goals.
	// Ex: array.filter().map()

	//Get data for the TV Show "Friends"
	fetch('https://api.tvmaze.com/shows/431?embed[]=episodes&embed[]=cast')
    .then((response) => response.json())
    .then((json) => {

        //DO NOT MODIFY THE CODE IN HERE...check the console for your functions' output

        //1 - Create a function called getGuntherCount() which returns the total number of episodes 
        // where the character Gunther is mentioned in the episode summary.
        console.log('--------------------------------');
        console.log(`Gunther Count: ${getGuntherCount(json)}`);

        //2 - Create a function called getTotalRuntimeMinutes() that totals all runtime minutes for all episodes
        console.log('--------------------------------');
        console.log(`Total Runtime Minutes: ${getTotalRuntimeMinutes(json)}`);

        //3 - Create a function called getDateRangeEpisodeCount() that returns the number of episodes that aired in the year 2000
        console.log('--------------------------------');
        console.log(`Total episodes airing in year 2000: ${getTotalEpisodesInYear(json, "2000")}`);

        //4 - Create a function called getFemaleCastMembers() that returns an array of the names of the female cast members.
        console.log('--------------------------------');
        console.log(`Female Cast Members:`);
        console.log(getFemaleCastMembers(json));

        //5 - Create a function called getEpisodeTitles() which returns a list of episode
        //    where the argument string is found in the episode summary.
        console.log('--------------------------------');
        console.log(`Episodes that mention Ursula:`);
        console.log(getEpisodeTitles(json, 'Ursula'));

        //6 - Create a function called getCastMembersOver55() which returns a list of cast members
        //    who are currently older than 55 years of age.
        console.log('--------------------------------');
        console.log(`Cast Members over 55:`);
        console.log(getCastMembersOver55(json));

        //7 - Create a function called getTotalRuntimeMinutesExcludingSeasonSix that gets the total 
        //    runtime minutes for all episodes excluding episodes in season 6
        console.log('--------------------------------');
        console.log(`Total runtime in minutes excluding Season 6: ${getTotalRuntimeMinutesExcludingSeasonSix(json)}`);
    
        //8 - Create a function called getFirstFourSeasons that gets the episodes for the first four seasons 
        //    but only return an array of JSON objects containing the season number and episode name
        console.log('--------------------------------');
        console.log(`Episode JSON for first four seasons:`)
        console.log(getFirstFourSeasons(json));

        //9 - Create a function called getEpisodeTallyBySeason that returns an object containing the season name and the total episodes as key:value pairs for each season
        console.log('--------------------------------');
        console.log(`Tally of episodes by season:`);
        console.log(getEpisodeTallyBySeason(json));

        //10 - Create a funtion called capitalizeTheFriends that transforms the episode JSON data by capitalizing the words Joey, Chandler, Monica, Rachel, Phoebe, and Ross in both 
        //the name and summary of the episodes.
        console.log('--------------------------------');
        console.log('Capitalized Friends');
        console.log(capitalizeTheFriends(json));

    })

	// COMPLETE THE FOLLOWING FUNCTIONS BY IMPLEMENTING MAP, REDUCE, OR FILTER 
	// (or a combination) ON THE PROVIDED JSON DATA

	// Define the required ten functions below this line...

	// helper - gets the episodes array out of the json
	const getEpisodes = (json) => json._embedded.episodes;

	// helper - gets the cast array out of the json
	const getCast = (json) => json._embedded.cast;

	// 1 - count the episodes where the summary mentions Gunther
	function getGuntherCount(json) {
		return getEpisodes(json)
			.filter(ep => ep.summary && ep.summary.includes('Gunther'))
			.length;
	}

	// 2 - add up the runtime of every episode
	function getTotalRuntimeMinutes(json) {
		return getEpisodes(json)
			.reduce((total, ep) => total + ep.runtime, 0);
	}

	// 3 - count the episodes that aired in the year that was passed in
	// airdate looks like "1994-09-22" so I check what it starts with
	function getTotalEpisodesInYear(json, year) {
		return getEpisodes(json)
			.filter(ep => ep.airdate && ep.airdate.startsWith(year))
			.length;
	}

	// 4 - names of the female cast members
	function getFemaleCastMembers(json) {
		return getCast(json)
			.filter(member => member.person.gender === 'Female')
			.map(member => member.person.name);
	}

	// 5 - episode titles where the summary has the text that was passed in
	function getEpisodeTitles(json, text) {
		return getEpisodes(json)
			.filter(ep => ep.summary && ep.summary.includes(text))
			.map(ep => ep.name);
	}

	// 6 - cast members who are older than 55 right now
	function getCastMembersOver55(json) {
		const today = new Date();

		// works out age in years, and takes one off if the birthday hasn't happened yet this year
		const getAge = (birthday) => {
			const birth = new Date(birthday);
			const hadBirthday =
				today.getMonth() > birth.getMonth() ||
				(today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
			return today.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
		};

		return getCast(json)
			.filter(member => member.person.birthday && getAge(member.person.birthday) > 55)
			.map(member => member.person.name);
	}

	// 7 - total runtime of all episodes except the ones in season 6
	function getTotalRuntimeMinutesExcludingSeasonSix(json) {
		return getEpisodes(json)
			.filter(ep => ep.season !== 6)
			.reduce((total, ep) => total + ep.runtime, 0);
	}

	// 8 - episodes from seasons 1 to 4, only keeping the season number and episode name
	function getFirstFourSeasons(json) {
		return getEpisodes(json)
			.filter(ep => ep.season <= 4)
			.map(ep => ({ season: ep.season, name: ep.name }));
	}

	// 9 - object with the season as the key and the number of episodes as the value
	// example: { "Season 1": 24, "Season 2": 24, ... }
	function getEpisodeTallyBySeason(json) {
		return getEpisodes(json)
			.reduce((tally, ep) => {
				const key = `Season ${ep.season}`;
				tally[key] = (tally[key] || 0) + 1;
				return tally;
			}, {});
	}

	// 10 - make the six friends' names capital letters in the episode name and summary
	function capitalizeTheFriends(json) {
		const friends = /\b(Joey|Chandler|Monica|Rachel|Phoebe|Ross)\b/g;
		const shout = (text) => text ? text.replace(friends, name => name.toUpperCase()) : text;

		return getEpisodes(json)
			.map(ep => ({
				...ep,
				name: shout(ep.name),
				summary: shout(ep.summary)
			}));
	}

})();

