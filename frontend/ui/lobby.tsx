import * as React from 'react';
import CustomWords from '~/ui/custom_words';
import WordSetToggle from '~/ui/wordset_toggle';
import TimerSettings from '~/ui/timer_settings';
import OriginalWords from '~/words.json';

// TODO: remove jquery dependency
// https://stackoverflow.com/questions/47968529/how-do-i-use-jquery-and-jquery-ui-with-parcel-bundler
var jquery = require('jquery');
window.$ = window.jQuery = jquery;

export const Lobby = ({ defaultGameID }) => {
  const [newGameName, setNewGameName] = React.useState(defaultGameID);
  const [selectedWordSets, setSelectedWordSets] = React.useState(['Pictures']);
  const [customWordsText, setCustomWordsText] = React.useState('');
  const [words, setWords] = React.useState({ ...OriginalWords, 'Custom': [] });
  const [warning, setWarning] = React.useState(null);
  const [timer, setTimer] = React.useState(null);

  let selectedWordCount = selectedWordSets
    .map(l => words[l].length)
    .reduce((a, cv) => a + cv, 0);

  React.useEffect(() => {
    if (selectedWordCount >= 25) {
      setWarning(null);
    }
  }, [selectedWordSets, customWordsText]);


  function handleNewGame(e) {
    console.log("herE");
    e.preventDefault();
    if (!newGameName) {
      return;
    }

    let combinedWordSet = selectedWordSets
      .map(l => words[l])
      .reduce((a, w) => a.concat(w), []);

    console.log(combinedWordSet.length);
    if (combinedWordSet.length < 25) {
      setWarning('Selected wordsets do not include at least 25 words.');
      return;
    }

    $.post(
      '/next-game',
      JSON.stringify({
        game_id: newGameName,
        word_set: combinedWordSet,
        create_new: false,
        timer_duration_ms:
          timer && timer.length
            ? timer[0] * 60 * 1000 + timer[1] * 1000
            : 0,
      }),
      (g) => {
        const newURL = (document.location.pathname = '/' + newGameName);
        window.location = newURL;
      }
    );
  }

  let toggleWordSet = (wordSet) => {
    let wordSets = [ ...selectedWordSets ];
    let index = wordSets.indexOf(wordSet);

    if index == -1 {
      wordSets.push(wordSet);
    } else {
      wordSets.splice(index, 1);
    }
    setSelectedWordSets(wordSets);
  };

  return (
    <div id="lobby">
      <div id="available-games">
        <form id="new-game">
          <p className="intro">
            Play Codenames online across multiple devices on a shared board. To
            create a new game or join an existing game, enter a game identifier
            and click 'GO'.
          </p>
          <input
            type="text"
            id="game-name"
            autoFocus
            onChange={(e) => {
              setNewGameName(e.target.value);
            }}
            value={newGameName}
          />

          <button disabled={!newGameName.length} onClick={handleNewGame}>
            Go
          </button>

          { warning !== null ? (<div className="warning">{warning}</div>) : <div></div> }

          <TimerSettings timer={timer} setTimer={setTimer} />

          <div id="new-game-options">
          </div>
        </form>
      </div>
    </div>
  );
};
