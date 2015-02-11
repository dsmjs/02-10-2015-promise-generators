/*    ____________ ________  ________ _____ _____ _____        
      | ___ \ ___ \  _  |  \/  |_   _/  ___|  ___/  ___|       
      | |_/ / |_/ / | | | .  . | | | \ `--.| |__ \ `--.        
      |  __/|    /| | | | |\/| | | |  `--. \  __| `--. \       
      | |   | |\ \\ \_/ / |  | |_| |_/\__/ / |___/\__/ /       
      \_|   \_| \_|\___/\_|  |_/\___/\____/\____/\____/        
                                                               
                                                               
                                                               
                            ___                                
                           ( _ )                               
                           / _ \/\                             
                          | (_>  <                             
                           \___/\/                             
                                                               
                                                               
 _____  _____ _   _  ___________  ___ _____ ___________  _____ 
|  __ \|  ___| \ | ||  ___| ___ \/ _ \_   _|  _  | ___ \/  ___|
| |  \/| |__ |  \| || |__ | |_/ / /_\ \| | | | | | |_/ /\ `--. 
| | __ |  __|| . ` ||  __||    /|  _  || | | | | |    /  `--. \
| |_\ \| |___| |\  || |___| |\ \| | | || | \ \_/ / |\ \ /\__/ /
 \____/\____/\_| \_/\____/\_| \_\_| |_/\_/  \___/\_| \_|\____/ 
                                                               
*/




//The Goal

function logDate() {
	var data = getJSON("http://date.jsontest.com/");
	console.log(data);
}

logDate();














// normal first shot (with jQuery of course)

var data = $.getJSON("http://date.jsontest.com/");
console.log(data);










// oh, callbacks, right.

var data;

$.get("http://date.jsontest.com/", function(response) {
	data = response;
});

console.log(data);














// ah, dang. everything in the callback

$.get("http://date.jsontest.com/", function(response) {
	var data = response;
	console.log(data);
});



















// that's okay, until you have more than one thing to call
// we've got nested callbacks :( and the two requests don't run in parallel

$.get("http://date.jsontest.com/", function(response) {
	var data = response;

	$.get("http://ip.jsontest.com/", function(response) {
		var ipdata = response;
		console.log(data);
		console.log(ipdata);
	});
});












// so enter promises

function asyncThing() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve("hello");
		}, 2000)
	});
}

asyncThing().then(function(response) {
	console.log(response);
});















// errors

function asyncThing() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			if (false) {
				resolve("Horray!")
			} else {
				reject("Oh no!");
			}
			
		}, 2000)
	});
}

asyncThing().then(function(response) {
	console.log(response);
}, function(error) {
	console.log(error);
});

// or just for the error
asyncThing().catch(function(error) {
	console.log(error);
});










// chaining!

function asyncThing() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve("hello");
		}, 2000)
	});
}

asyncThing()
	.then(function(response) { 
		return response.toUpperCase();
	})
	.then(function(response) { 
		return console.log(response);
	});

function log(data) {
	console.log(data);
}


asyncThing()
	.then(response => response.toUpperCase())
	.then(log);








// AJAX - jQuery returns a promise (though not a native one)

$.get("http://date.jsontest.com/")
	.then(function(data) {
		console.log(data);
	});

// fetch, a new api, returns a native promise! (it's a little more work though)

fetch("http://date.jsontest.com/")
	.then(function(resp) {
		// parse out the JSON from the response
		return resp.json();
	})
	.then(function(data) {
		console.log(data);
	});










// combining promise

Promise.all([promise1, promise2])
	.then(values => console.log(values)); // [p1, p2]





// back to our example -- we're getting closer!

function getJSON(url) {
	return fetch(url).then(function(resp) {
		return resp.json();
	};
}

function logDate() {
	var promise = getJSON("http://date.jsontest.com/");
	promise.then(function(data) {
		console.log(data);
	});
}

logDate();










// Enter generators

function* myGenerator() {
	yield 1;
	yield 2;
	yield 3;
}

var it = myGenerator();

it.next(); // { value: 1, done: false}
it.next(); // { value: 2, done: false}
it.next(); // { value: 3, done: false}
it.next(); // { value: undefined, done: true}





// it can take params

function *myGenerator(x, y) {
	yield x + y;
}

var it = myGenerator(1, 2);

it.next(); // { value: 3, done: false}




// but you can also pass in values to yield! this is where it get CRAZY.

function *myGenerator(x) {
	var z = x + (yield);
	return z;
}

var it = myGenerator(10);

it.next(); // {value: undefined, done: false}

it.next(5); // {value: 15, done: true}






// crazier yet, yield can return a value, then have it be changed on the next call

function *myGenerator(x) {
	var z = x + (yield 27);
	return z;
}

var it = myGenerator(10);

it.next(); // {value: 27, done: false}

it.next(5); // {value: 15, done: true}





// so we can pass the results of a function back into it.
function awesome() {
	return 5;
}

function *myGenerator(x) {
	var z = x + (yield awesome());
	return z;
}

var it = myGenerator(10);

var res = it.next(); // {value: 5, done: false}

it.next(res.value); // {value: 15, done: true}






// the start of the async magic
var it;

function awesome() {
	setTimeout(function() {
		it.next(5);
	}, 2000);
}

function *myGenerator() {
	var z = yield awesome();
	console.log(z);
}

var it = myGenerator();

it.next(); // kicks it off

// 2 seconds later, 5 is logged







// so with ajaxData

var it;

function awesome() {
	$.get("/data.json", function(data) {
		it.next(data);
	});
}

function *myGenerator(x) {
	var z = yield awesome();
	console.log(z);
}

var it = myGenerator();

it.next();

// the data will get logged when the ajax is done








// with promises! but first a helper

// helper that will loop through an entire generator that is promise aware
function runGenerator(gen) {
	var it = gen();

	function loop(val) {
		var resp = it.next(val);

		if (!resp.done) {
			if ("then" in resp.value) {
				// if it's a promise, iterate with the resolved value
				resp.value.then(function(results) {
					loop(results)
				});
			} else {
				// iterate with the value
				loop(resp.value);
			}
		}
	}

	loop();
}

// helper for fetch to actually parse the json
function getJSON(url) {
	return fetch(url).then(function(result) {
		return result.json();
	});
}

// our "app" code. we made it. close enough in my book.
function *logDate() {
	var data = yield getJSON("http://date.jsontest.com/");
	console.log(data);
}

runGenerator(logDate);










// the not so distant future (ES7)

var getJSON = url => fetch(url).then(result => result.json());

async function logDate() {
	var data = await getJSON("http://data.jsontest.com/");
	console.log(data);
}

logDate();