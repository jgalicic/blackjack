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
      this.numAces = 0;
      this.isPlaying = false;
      this.isDoneMakingDecisions = false;
      this.hasWon = false;
      this.hasLost = false;
      this.pushes = false;
      this.stands = false;
      this.hits = false;
      this.hasTakenItsTurn = false;
      this.message = "";
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

  function clog(message, color) {
    color = color || "black";

    switch (color) {
      case "success":
        color = "Green";
        break;

      case "info":
        color = "DodgerBlue";
        break;

      case "error":
        color = "Red";
        break;

      case "warning":
        color = "Orange";
        break;

      default:
        color = color;
    }

    console.log("%c" + message, "color:" + color);
  }

  function calculateScore(player) {
    clog(`Begin calculateScore on ${player.name}`, "green");
    player.score = 0;
    player.altScore = 0;
    player.numAces = 0;

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
        player.numAces += 1;
      }
    });

    // In the event that the player has multiple aces:
    // player.altScore will count one ace as 11 and the rest as 1.
    if (player.numAces > 1) {
      let acesToMultiply = player.numAces - 1;
      let multiply = acesToMultiply * 10;
      player.altScore = player.altScore - multiply;
    }
    clog(`End calculateScore on ${player.name}`, "tomato");
  }

  function dealerPlaysHand() {
    clog(`Begin dealerPlaysHand`, "blue");
    // Dealer should only play once after the waiting period is over
    if (!dealer.hasTakenItsTurn && !waitingForOthersToJoin) {
      dealer.hasTakenItsTurn = true;

      // flip over dealer's hidden card
      $("#card_back").hide();

      // calculate dealer's score
      calculateScore(dealer);

      // dealer hits if they have a soft 17 and nobody has lost
      while (dealer.altScore < 17 && !checkIfAtLeastOnePlayerHasLost()) {
        dealer.takeACard(deck1);
        dealer.hits = true;
        calculateScore(dealer);
      }

      // refresh dealer's hand
      $("#dealer-container").html(refreshDealerHand(dealer));

      if (dealer.altScore > 21) {
        $("#score").html(`<p>${dealer.score}</p>`);
      } else {
        $("#score").html(`<p>${dealer.altScore}</p>`);
      }
    }
    clog(`End dealerPlaysHand`, "orange");
  }

  function refreshPlayerHand(player) {
    console.log("Begin refreshPlayerHand on " + player.name);
    calculateScore(player);

    let playerHand = "";

    playerHand += `<div id="playercontainer--${
      player.id
    }" class="player-container"><div><h2>${player.name}</h2>`;

    player.showHand().forEach((val, index) => {
      playerHand += `<div id='card--${player.id}--${index +
        1}' class='card'><img src="cards/${val}.png"></div>`;
    });
    playerHand += `<div class="buttons container">`;

    // disanimate hit and stand buttons
    if (
      !gameHasStarted ||
      player.hasWon ||
      player.hasLost ||
      (player.stands && player.hasTakenItsTurn)
    ) {
      playerHand += `<button class="hitbtn" id="hit--${
        player.id
      }"><span>Hit</span></button>`;
      playerHand += `<button class="standbtn" id="stand--${
        player.id
      }"><span>Stand</span></button>`;
    }

    // animate hit and stand buttons
    else {
      playerHand += `<button class="hitbtn" id="hit--${
        player.id
      }"><span class="flickerAnimation">Hit</span></button>`;
      playerHand += `<button class="standbtn" id="stand--${
        player.id
      }"><span class="flickerAnimation">Stand</span></button>`;
    }

    playerHand += `<button class="exitbtn" id="exit--${
      player.id
    }">Exit Game</button></div>`;
    playerHand += `<div class="infodiv" id="info--${player.id}">${
      player.message
    }</div></div></div></div></div>`;

    console.log("End refreshPlayerHand on " + player.name);
    return playerHand;
  } // return playerHand (HTML string)

  function refreshDealerHand(dealer) {
    console.log("Begin refreshDealerHand on " + dealer.name);
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
    console.log("End refreshDealerHand on " + dealer.name);

    return dealerHand;
  } // return dealerHand (HTML string)

  function checkIfPlayerWon(player) {
    console.log("Begin checkIfPlayerWon on " + player.name);

    calculateScore(player);

    if (
      player.altScore == 21 &&
      player.hasTakenItsTurn == false &&
      dealer.hasTakenItsTurn == false &&
      player.isPlaying == true
    ) {
      player.message = "BLACKJACK!";
      player.stands = true;
      player.hasWon = true;
      playerIsDone(player);
    } else {
      // Check if dealer has a blackjack
      if (
        dealer.altScore == 21 &&
        player.altScore != 21 &&
        player.hasTakenItsTurn == false
      ) {
        // console.log(`Dealer has a blackjack`);
        player.message = "BLACKJACK! Dealer wins!";
        player.hasLost = true;
        playerIsDone(player);
      }

      // Check if dealer AND player have a blackjack
      else if (
        dealer.altScore == 21 &&
        player.altScore == 21 &&
        player.hasTakenItsTurn == false
      ) {
        // console.log(`${player.name} & dealer both have blackjacks`);
        player.message = "TWO BLACKJACKS! You and Dealer push!";
        player.pushes = true;
        playerIsDone(player);
      }

      // Check if player has had a chance to take their first turn
      else if (player.hasTakenItsTurn) {
        // console.log(`${player.name} has taken their first turn`);
        // Check if dealer is at 21 and player is not
        if (
          (player.score != 21 && dealer.score == 21) ||
          (player.altScore != 21 && dealer.altScore == 21) ||
          (player.altScore != 21 && dealer.score == 21) ||
          (player.score != 21 && dealer.altScore == 21)
        ) {
          // console.log(`Dealer is at 21 - dealer wins`);
          player.message = "21! Dealer wins!";
          player.hasLost = true;
          playerIsDone(player);
        }

        // Check if player is at 21 and dealer is not
        else if (
          (player.score == 21 && dealer.score != 21) ||
          (player.altScore == 21 && dealer.altScore != 21) ||
          (player.altScore == 21 && dealer.score != 21) ||
          (player.altScore == 21 && dealer.score != 21)
        ) {
          // console.log(`${player.name} is at 21 - you win`);
          player.message = "21! You win!";
          player.hasWon = true;
          playerIsDone(player);
        }

        // Check if player goes over (dealer wins)
        else if (player.score > 21 && dealer.score <= 21) {
          // console.log(`${player.name} is over 21`);
          player.message = "Bust! Dealer wins";
          player.hasLost = true;
          playerIsDone(player);
        }

        // Check if dealer goes over (player wins)
        else if (player.score <= 21 && dealer.score > 21) {
          // console.log(`Dealer busts. ${player.name} wins`);
          player.message = "Dealer busts! You win";
          player.hasWon = true;
          playerIsDone(player);
        }

        // If dealer score >= 17.....
        if (dealer.score >= 17) {
          // Check if player and dealer push
          if (player.score == dealer.score) {
            // console.log(`Dealer and ${player.name} push`);
            player.message = `${player.score} - Push!`;
            player.hasWon = true;
            playerIsDone(player);
          }
          // Check if dealer is higher than player
          else if (
            (dealer.score > player.score &&
              dealer.score <= 21 &&
              player.numAces == 0 &&
              player.stands == true) ||
            (dealer.altScore > player.altScore &&
              dealer.altScore <= 21 &&
              player.stands == true) ||
            (dealer.altScore > player.score &&
              dealer.numAces >= 1 &&
              dealer.altScore <= 21 &&
              player.stands == true)
          ) {
            // console.log(`Dealer is higher than ${player.name}`);
            if (player.altScore <= 21) {
              player.message = `${player.altScore} - Dealer wins!`;
            } else {
              player.message = `${player.score} - Dealer wins!`;
            }

            player.hasLost = true;
            playerIsDone(player);
          }
          // Check if player is higher than dealer
          else if (
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
            // console.log(`${player.name} is higher than dealer`);
            if (player.altScore <= 21) {
              player.message = `${player.altScore} - You win!`;
            } else {
              player.message = `${player.score} - You win!`;
            }
            player.hasWon = true;
            playerIsDone(player);
          }
        } // end dealer score >= 17
      } // end playerTookTheirFirstTurn && gameOver == false
    }

    // WARNING: THIS CAUSES AN INFINITE LOOP:
    // // if all players are out
    // if (!checkIfAtLeastOnePlayerIsStillIn()) {
    //   $("#card_back").hide();
    //   renderAllPlayersCards();
    // }
    // // Render message to the page
    // $(`#info--${player.id}`).text(player.message);

    if (player.message == "") {
      // console.log(`${player.name}'s message is empty`);
    }
    console.log("End checkIfPlayerWon on " + player.name);
  }

  function renderAllPlayersCards() {
    clog(`Begin renderAllPlayersCards`, "purple");

    playersHtml = "";
    for (let i = 1; i < allPlayers.length; i++) {
      checkIfPlayerWon(allPlayers[i]);
      playersHtml += refreshPlayerHand(allPlayers[i]);
    }
    $(".players-container").html(playersHtml);

    clog(`End renderAllPlayersCards`, "gold");
  }

  function playerIsDone(player) {
    clog("     Begin playerIsDone", "pink");
    // check if player is still playing
    if (player.isPlaying) {
      player.isPlaying = false;
      player.isDoneMakingDecisions = true;

      $(`#hit--${player.id}`)
        .children()
        .removeClass("flickerAnimation");
      $(`#stand--${player.id}`)
        .children()
        .removeClass("flickerAnimation");
    }

    clog("     End playerIsDone", "pink");
  }

  function showNumberOfPlayersPlaying() {
    console.log("Begin showNumberOfPlayersPlaying");
    // console.log(445);
    if (!gameHasStarted) {
      $("#players_playing")
        .html(`<div id="numOfPlayers">Waiting for others to join...</div>`)
        .addClass("flickerAnimation");
    } else {
      $("#players_playing").removeClass("flickerAnimation");
      let numPlayers = 0;

      allPlayers.forEach(val => {
        if (val.isPlaying == true) numPlayers++;
      });

      if (numPlayers === 0) {
        $("#form_container").html(`<div id="numOfPlayers"></div>`);
      } else if (numPlayers === 1) {
        $("#form_container").html(
          `<div id="numOfPlayers">1 person playing</div><div class="white">Dealer must hit soft 17</div>`
        );
      } else {
        $("#form_container").html(
          `<div id="numOfPlayers">${numPlayers} people playing</div><div class="white">Dealer must hit soft 17</div>`
        );
      }
    }
    console.log("End showNumberOfPlayersPlaying");
  }

  function checkIfAtLeastOnePlayerHasLost() {
    console.log("Begin checkIfAtLeastOnePlayerHasLost");

    // console.log(486);
    for (var i = 1; i < allPlayers.length; i++) {
      // return true if any players have lost
      if (allPlayers[i].hasLost) {
        console.log("End checkIfAtLeastOnePlayerHasLost - returning true");
        return true;
      }
    }
    console.log("End checkIfAtLeastOnePlayerHasLost - returning false");
    return false;
  }

  function checkIfAllPlayersStayOrAreOut() {
    console.log("Begin checkIfAllPlayersStayOrAreOut");
    // console.log(495);
    // loop through players who are still playing
    for (var i = 1; i < allPlayers.length; i++) {
      if (!allPlayers[i].isDoneMakingDecisions) {
        console.log("End checkIfAllPlayersStayOrAreOut - returning false");
        return false;
      }
    }
    console.log("End checkIfAllPlayersStayOrAreOut - returning true");
    // return true if all players stay
    return true;
  }

  function checkIfAllPlayersHaveExitedGame() {
    console.log("Begin checkIfAllPlayersHaveExitedGame - returning true");
    checkIfAllPlayersStayOrAreOut;
    // console.log(502);
    for (let i = 1; i < allPlayers.length; i++) {
      if (allPlayers[i].isPlaying) {
        console.log("End checkIfAllPlayersHaveExitedGame - returning false");
        return false;
      }
    }
    console.log("End checkIfAllPlayersHaveExitedGame - returning true");

    return true;
  }

  function playerEntersGame() {
    let name = $("#name_input").val();

    console.log("     Begin playerEntersGame ", name);

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
    console.log("     End playerEntersGame ", name);
  }

  ///////////// Player Hits /////////////
  function playerHits(current_player) {
    if (!current_player.isDoneMakingDecisions) {
      current_player.hits = true;
      current_player.hasTakenItsTurn = true;
      current_player.takeACard(deck1);
      renderAllPlayersCards();
      checkIfPlayerWon(current_player);

      // if all players have taken their first turn
      if (checkIfAllPlayersStayOrAreOut()) {
        console.log("!!!!!!!!!!!");
        dealerPlaysHand();
        renderAllPlayersCards();
      }
    }
  }

  //////////// Player Stands /////////////
  function playerStands(current_player) {
    if (!current_player.isDoneMakingDecisions) {
      current_player.hasTakenItsTurn = true;
      current_player.hits = false;
      current_player.stands = true;
      current_player.isDoneMakingDecisions = true;
      // console.log(allPlayers);

      $(`#hit--${current_player.id}`)
        .children()
        .removeClass("flickerAnimation");
      $(`#stand--${current_player.id}`)
        .children()
        .removeClass("flickerAnimation");

      // if all players stand
      if (checkIfAllPlayersStayOrAreOut()) {
        console.log("!!!!!!!!!!!");
        dealerPlaysHand();
        renderAllPlayersCards();
      }
    }
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

    // only run one time, right when the first player joins
    if (
      !gameHasStarted &&
      waitingForOthersToJoin &&
      !firstPlayerIsWaitingToJoin
    ) {
      firstPlayerIsWaitingToJoin = true;
      // this timer will begin once the first player joins
      setTimeout(() => {
        gameHasStarted = true;
        waitingForOthersToJoin = false;
        showNumberOfPlayersPlaying();

        allPlayers.forEach(player => {
          if (player.id > 0) {
            refreshPlayerHand(player);
            // Render message to the page
            $(`#info--${player.id}`).text(player.message);
            // if player doesn't have a blackjack, animate buttons
            if (player.altScore != 21) {
              $(`#hit--${player.id} span`).addClass("flickerAnimation");
              $(`#stand--${player.id} span`).addClass("flickerAnimation");
            }
          }
        });
      }, 5000);
    }

    playerEntersGame();

    allPlayers.forEach(player => {
      if (player.id > 0) {
        refreshPlayerHand(player);
        // Render message to the page
        $(`#info--${player.id}`).text(player.message);
      }
    });

    // clear form
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

      // prevent player from hitting if they already stand
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

      checkIfAllPlayersStayOrAreOut();
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

  // setTimeout(() => {
  //   // console.log(allPlayers);
  // }, 20000);

  // end jquery
});
