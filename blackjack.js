$(document).ready(function() {
  let gameHasStarted = false;
  let firstPlayerIsWaitingToJoin = false;
  let waitingForOthersToJoin = true;
  let playersHtml = ""; // html to be rendered
  const allPlayers = []; // an array of player objects

  // DECLARE CLASSES
  class Deck {
    constructor() {
      this.deck = [];

      const suits = ["Hearts", "Spades", "Clubs", "Diamonds"];
      const values = [
        "Ace",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        "Jack",
        "Queen",
        "King"
      ];

      for (let suit in suits) {
        for (let value in values) {
          this.deck.push(`${values[value]}_of_${suits[suit]}`);
        }
      }
    }
    shuffle() {
      var j, x, i;
      for (i = this.deck.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this.deck[i];
        this.deck[i] = this.deck[j];
        this.deck[j] = x;
      }
      return this.deck;
    }
    deal() {
      let cardIndex = Math.floor(Math.random() * this.deck.length);
      let drawnCard = this.deck.splice(cardIndex, 1);
      return drawnCard;
    }
  }

  class Player {
    constructor(name, deck, id) {
      this.id = id;
      this.name = name;
      this.deck = deck;
      this.hand = [];
      this.score = 0;
      this.altScore = 0;
      this.isPlaying = false;
      this.stands = false;
      this.hits = false;
      this.hasTakenItsTurn = false;
    }
    takeACard(deck) {
      return this.hand.push(deck.deal());
    }

    showHand() {
      let hand = [];
      this.hand.forEach(val => {
        hand.push(val[0].toLowerCase());
      });
      return hand;
    }
  }

  // FUNCTIONS
  function calculateScore(player) {
    console.log("Calling calulateScore on", player.name);
    player.score = 0;
    player.altScore = 0;
    player.showHand().forEach(val => {
      if (val[0] == "2") {
        player.score += 2;
        player.altScore += 2;
      } else if (val[0] == "3") {
        player.score += 3;
        player.altScore += 3;
      } else if (val[0] == "4") {
        player.score += 4;
        player.altScore += 4;
      } else if (val[0] == "5") {
        player.score += 5;
        player.altScore += 5;
      } else if (val[0] == "6") {
        player.score += 6;
        player.altScore += 6;
      } else if (val[0] == "7") {
        player.score += 7;
        player.altScore += 7;
      } else if (val[0] == "8") {
        player.score += 8;
        player.altScore += 8;
      } else if (val[0] == "9") {
        player.score += 9;
        player.altScore += 9;
      } else if (val[0] == "1") {
        player.score += 10;
        player.altScore += 10;
      } else if (val[0] == "j") {
        player.score += 10;
        player.altScore += 10;
      } else if (val[0] == "q") {
        player.score += 10;
        player.altScore += 10;
      } else if (val[0] == "k") {
        player.score += 10;
        player.altScore += 10;
      } else if (val[0] == "a") {
        player.score += 1;
        player.altScore += 11;
      }
    });
    console.log(player.name + " SCORE:", player.score);
    console.log(player.name + " ALTSCORE:", player.altScore);
  }

  function showNumberOfPlayersPlaying() {
    if (!gameHasStarted) {
      $("#players_playing")
        .html(`<div id="numOfPlayers">Waiting for others to join...</div>`)
        .addClass("flickerAnimation");
    } else {
      $("#players_playing").removeClass("flickerAnimation");
      let numPlayers = 0;

      allPlayers.forEach((val, index) => {
        if (val.isPlaying == true) numPlayers++;
      });

      if (numPlayers === 0) {
        $("#form_container").html(`<div id="numOfPlayers"></div>`);
      } else if (numPlayers === 1) {
        $("#form_container").html(
          `<div id="numOfPlayers">1 person playing</div>`
        );
      } else {
        $("#form_container").html(
          `<div id="numOfPlayers">${numPlayers} people playing</div>`
        );
      }
    }
  }

  function dealerPlaysHand() {
    dealer.hasTakenItsTurn = true;
    console.log("Dealer is playing its hand...");
    console.log("DEALER HAND", dealer.hand);

    $("#score").html(`<p>${dealer.score}</p>`);

    // dealer hits if they have a soft 17
    if (dealer.altScore <= 17 && dealer.hits == false) {
      dealer.takeACard(deck1);
      dealer.hits = true;
      dealer.hasTakenItsTurn = true;
    }

    calculateScore(dealer);

    console.log("Dealer's score: ", dealer.score);
    console.log("Dealer's altScore: ", dealer.altScore);

    // refresh dealer's hand
    $("#dealer-container").html(refreshDealerHand(dealer));

    // dealer hits if they have less than 17
    console.log("Dealer playing hand");
    console.log(
      "Is at least one player still in? ",
      checkIfAtLeastOnePlayerIsStillIn()
    );

    $("#score").html(`<p>${dealer.score}</p>`);

    console.log("Dealer has finished playing its hand");
  }

  function refreshPlayerHand(player) {
    calculateScore(player);

    let playersCurrentScore = player.altScore;

    if (player.altScore > 21) {
      playersCurrentScore = player.score;
    }

    let playerHand = "";

    if (player.isPlaying) {
      playerHand += `<div id="playercontainer--${
        player.id
      }" class="player-container"><div><h2>${player.name}</h2>`;

      player.showHand().forEach((val, index) => {
        playerHand += `<div id='card--${player.id}--${index +
          1}' class='card'><img src="cards/${val}.png"></div>`;
      });
      playerHand += `<div class="buttons container">`;
      playerHand += `<button class="hitbtn" id="hit--${
        player.id
      }"><span>Hit</span> ${playersCurrentScore}</button>`;
      playerHand += `<button class="standbtn" id="stand--${
        player.id
      }"><span>Stand</span></button>`;
      playerHand += `<button class="exitbtn" id="exit--${
        player.id
      }">Exit Game</button></div>`;
      playerHand += `<div class="infodiv" id="info--${
        player.id
      }"></div</div></div></div></div>`;
    }

    return playerHand;
  } // return playerHand (HTML string)

  function refreshDealerHand(dealer) {
    dealerHand = "";

    dealer.showHand().forEach((val, index) => {
      //keep dealer's first card flipped over initially
      if (index == 0 && !dealer.hasTakenItsTurn) {
        dealerHand += `<div id='dealer${index +
          1}' class='card'><img id="card_back" src="cards/card_back.png"></div>`;
      } else {
        dealerHand += `<div id='dealer${index +
          1}' class='card'><img src="cards/${val}.png"></div>`;
      }
    });

    return dealerHand;
  } // return dealerHand (HTML string)

  function checkIfPlayerWon(player) {
    console.log(`Checking if ${player.name} won`);

    // Check if player went over 21

    if (player.score > 21) {
      playerIsDone(player, "Bust! You're over 21");
    }

    // Check if player has a blackjack
    if (
      player.altScore == 21 &&
      dealer.altScore != 21 &&
      player.hasTakenItsTurn == false
    ) {
      playerIsDone(player, "BLACKJACK! You win!");
      console.log("CODE 1");
    }

    // Check if dealer has a blackjack
    if (
      dealer.altScore == 21 &&
      player.altScore != 21 &&
      player.hasTakenItsTurn == false
    ) {
      playerIsDone(player, "BLACKJACK! Dealer wins!");
      $("#card_back").hide();
      console.log("CODE 2");
    }

    // Check if dealer AND player have a blackjack
    if (
      dealer.altScore == 21 &&
      player.altScore == 21 &&
      player.hasTakenItsTurn == false
    ) {
      playerIsDone(player, "TWO BLACKJACKS! You and Dealer push!");
      $("#card_back").hide();
      console.log("CODE 3");
    }

    // Check if player has had a chance to take their first turn
    if (player.hasTakenItsTurn) {
      // Check if dealer is at 21 and player is not
      if (
        (player.score != 21 && dealer.score == 21) ||
        (player.altScore != 21 && dealer.altScore == 21) ||
        (player.altScore != 21 && dealer.score == 21) ||
        (player.score != 21 && dealer.altScore == 21)
      ) {
        playerIsDone(player, "21! Dealer wins!");
        console.log("CODE 4");
      }

      // Fix this - dealer should keep dealing cards to itself up to a soft 17 is a player is at 21
      // Check if player is at 21 and dealer is not
      if (
        (player.score == 21 && dealer.score != 21) ||
        (player.altScore == 21 && dealer.altScore != 21) ||
        (player.altScore == 21 && dealer.score != 21) ||
        (player.altScore == 21 && dealer.score != 21)
      ) {
        playerIsDone(player, "21! You win!");
        console.log("CODE 5");
      }

      // Check if player goes over (dealer wins)
      if (player.score > 21 && dealer.score <= 21) {
        playerIsDone(player, "Bust! Dealer wins");
        console.log("CODE 6");
      }

      // Check if dealer goes over (player wins)
      if (player.score < 21 && dealer.score > 21) {
        playerIsDone(player, "Dealer busts - you win!");
        console.log("CODE 7");
      }

      // If dealer score >= 17.....
      if (dealer.score >= 17) {
        console.log("Dealer score is >= 17...");

        // Check if dealer is higher than player
        if (
          (dealer.score > player.score &&
            dealer.score <= 21 &&
            player.stands == true) ||
          (dealer.altScore > player.altScore &&
            dealer.altScore <= 21 &&
            player.stands == true) ||
          (dealer.altScore > player.score &&
            dealer.altScore <= 21 &&
            player.stands == true)
        ) {
          playerIsDone(player, "Dealer wins!");
          console.log("CODE 8");
        }
        // Check if player is higher than dealer
        if (
          (player.score > dealer.score &&
            player.score <= 21 &&
            player.stands == true) ||
          (player.altScore > dealer.altScore &&
            player.altScore <= 21 &&
            player.stands == true) ||
          (player.altScore > dealer.score &&
            player.altScore <= 21 &&
            player.stands == true)
        ) {
          playerIsDone(player, "You win!");
          console.log("CODE 9");
        }
      } // end dealer score >= 17
    } // end playerTookTheirFirstTurn && gameOver == false

    console.log("CODE 10");
  }

  function renderAllPlayersCards() {
    playersHtml = "";
    for (let i = 1; i < allPlayers.length; i++) {
      if (allPlayers[i].isPlaying == true) {
        playersHtml += refreshPlayerHand(allPlayers[i]);
      }
    }
    $(".players-container").html(playersHtml);
  }

  function activateAllButtons() {
    $(".hitbtn span").addClass("flickerAnimation");
    $(".standbtn span").addClass("flickerAnimation");
  }

  function playerIsDone(player, message) {
    player.isPlaying = false;
    refreshPlayerHand(player);
    $(`#info--${player.id}`).html(message);
    // gameOver = true;
    // $("#message").html(message);
    // $("#card_back").hide();
    // $(".hitbtn, .standbtn").css("background-color", "gray");
    // $(".hitbtn, .standbtn").css("border", "none");
  }

  function checkIfAtLeastOnePlayerIsStillIn() {
    for (var i = 1; i < allPlayers.length; i++) {
      // return true if any players are still in the game
      if (allPlayers[i].isPlaying) return true;
    }
    return false;
  }

  function checkIfAllPlayersStay() {
    // loop through players who are still playing
    for (var i = 1; i < allPlayers.length; i++) {
      if (allPlayers[i].isPlaying && !allPlayers[i].stands) {
        // if any player is still deciding, return false
        return false;
      }
    }
    // return true if all players stay
    return true;
  }

  function checkIfAllPlayersHaveExitedGame() {
    for (let i = 1; i < allPlayers.length; i++) {
      if (allPlayers[i].isPlaying) {
        return false;
      }
    }
    return true;
  }

  function playerEntersGame() {
    let name = $("#name_input").val();
    let newPlayer = new Player(name, deck1, allPlayers.length); // name, deck, id
    newPlayer.isPlaying = true; // will turn false when they are out of the game

    // player takes two cards
    newPlayer.takeACard(deck1);
    newPlayer.takeACard(deck1);

    // push player onto the allPlayers array
    allPlayers.push(newPlayer);

    // show number of players
    showNumberOfPlayersPlaying();

    // render players hands
    renderAllPlayersCards();

    // check if player got a blackjack
    checkIfPlayerWon(newPlayer);
  }

  ///////////// Player Hits /////////////
  function playerHits(current_player) {
    current_player.hits = true;
    current_player.takeACard(deck1);

    // refresh cards
    playersHtml = "";
    // Loop through all current players
    for (let i = 1; i < allPlayers.length; i++) {
      playersHtml += refreshPlayerHand(allPlayers[i]);
    }
    $(".players-container").html(playersHtml);

    // if all players have taken their first turn
    if (checkIfAllPlayersStay()) {
      // dealer plays its hand
      dealerPlaysHand();
      // flip over dealer's hidden card
      $("#card_back").hide();
    }
    checkIfPlayerWon(current_player);
  }

  //////////// Player Stands /////////////
  function playerStands(current_player) {
    current_player.hasTakenItsTurn = true;
    current_player.hits = false;
    current_player.stands = true;

    // if all players have taken their first turn
    if (checkIfAllPlayersStay()) {
      console.log("All players stay");
      // dealer plays its hand
      dealerPlaysHand();
      // flip over dealer's hidden card
      $("#card_back").hide();
    }

    checkIfPlayerWon(current_player);
  }

  /////////////////////////////////////////////////////////
  ////////////////// INITIALIZE GAME //////////////////////
  /////////////////////////////////////////////////////////

  // create deck
  const deck1 = new Deck();

  // create dealer and push to allPlayers
  const dealer = new Player("Dealer", deck1, 0);

  // push dealer onto the allPlayers array
  allPlayers.push(dealer);

  // dealer takes two cards
  dealer.takeACard(deck1);
  dealer.takeACard(deck1);

  // render dealer's cards
  $("#dealer-container").html(refreshDealerHand(dealer));

  // player enters game
  $("#name_form").submit(function(event) {
    event.preventDefault();

    // only run once when the first player joins
    if (
      !gameHasStarted &&
      waitingForOthersToJoin &&
      !firstPlayerIsWaitingToJoin
    ) {
      firstPlayerIsWaitingToJoin = true;

      // this will run 8 seconds after the first player joins
      setTimeout(() => {
        gameHasStarted = true;
        showNumberOfPlayersPlaying();
        activateAllButtons();
      }, 8000);
    }

    playerEntersGame();
    $(this).trigger("reset");
  });

  // hit button
  $(".players-container").on("click", `.hitbtn`, function() {
    if (gameHasStarted) {
      // get player id from click event
      let card_container_id = $(this)
        .parent()
        .parent()
        .parent()
        .attr("id");
      let id = card_container_id[card_container_id.length - 1];
      let current_player = allPlayers[id];

      if (!allPlayers[id].stands) {
        playerHits(current_player);
      }
    }
  });

  // stand button
  $(".players-container").on("click", ".standbtn", function() {
    if (gameHasStarted) {
      let card_container_id = $(this)
        .parent()
        .parent()
        .parent()
        .attr("id");
      let id = card_container_id[card_container_id.length - 1];
      let current_player = allPlayers[id];

      playerStands(current_player);

      checkIfAllPlayersStay();
    }
  });

  // player exits game
  $(".players-container").on("click", ".exitbtn", function() {
    event.preventDefault();
    let card_container_id = $(this)
      .parent()
      .parent()
      .parent()
      .attr("id");
    let id = card_container_id[card_container_id.length - 1];
    let current_player = allPlayers[id];

    current_player.isPlaying = false;

    $("#" + card_container_id).hide();

    renderAllPlayersCards();

    showNumberOfPlayersPlaying();

    // reset game if everyone has exited
    if (checkIfAllPlayersHaveExitedGame()) {
      location.reload();
    }
  });

  // Delete later...
  setTimeout(() => {
    console.log(allPlayers);
    console.log("GameHasStarted?", gameHasStarted);
    console.log("Everyone's made a decision?", checkIfAllPlayersStay());
  }, 20000);

  // end jquery
});
