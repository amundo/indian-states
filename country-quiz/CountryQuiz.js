class CountryQuiz extends HTMLElement {
  constructor() {
      super();
      this.score = 0;
      this.totalStates = 0;
      this.guessedStates = new Set();
      this.currentTarget = null;
  }

  connectedCallback() {
      this.innerHTML = `
          <select class="country-select"></select>
          <aside class=info>
            <div class="score-display">Score: ${this.score}</div>
            <div class="meaning-display"></div>
            <div class="status-display"></div>
          </aside>
          <svg></svg>
      `;
      
      this.select = this.querySelector('.country-select');
      this.scoreDisplay = this.querySelector('.score-display')
      this.meaningDisplay = this.querySelector('.meaning-display')
      this.statusDisplay = this.querySelector('.status-display');
      this.svg = this.querySelector('svg');
      
      this.loadCountries();
      this.select.addEventListener('change', (e) => this.fetchData(e.target.value));
  }

  loadCountries() {
      const countries = ['india', 'brazil', 'australia', 'mexico'];
      countries.forEach(country => {
          const option = document.createElement('option');
          option.value = `countries/${country}.json`;
          option.textContent = country.charAt(0).toUpperCase() + country.slice(1);
          this.select.appendChild(option);
      });
  }

  async fetchData(url) {
    try {
      url = new URL( url, window.location.href ).href; // Ensure the URL is absolute

      console.log(url)
      const response = await fetch(url);

      const data = await response.json()
      this.data = data
      this.totalStates = data.length
      this.renderSVG(data)
      this.startNewRound(data)
    } catch(error){
      console.error("Error fetching data:", error);
    }
  }

  renderSVG(data) {
      this.svg.innerHTML = ``; // Clear the SVG container
      this.updateScore();

      data.forEach(state => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', state.d); // Assuming 'd' contains SVG path data
          path.setAttribute('id', state.state_code);
          path.dataset.stateCode = state.state_code;
          path.dataset.state = state.state
          path.dataset.meaning = state.meaning;
          path.addEventListener('click', () => this.handleGuess(path.dataset.stateCode, data, path));
          this.svg.appendChild(path);
      });

      // Set SVG viewBox based on bounding box of paths
      const bbox = this.svg.getBBox();
      this.svg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  handleGuess(guess, data, path) {
      if (guess === this.currentTarget) {
          this.score++;
          this.guessedStates.add(this.currentTarget)

          let state = data
            .find(state => state.state_code === this.currentTarget);
          
          path.classList.add('guessed') // Add a class to visually indicate the guessed state
          this.statusDisplay.innerHTML = `<span class="correct">Correct! The state is <strong>${state.state}</strong>, meaning <em>${state.meaning}</em>.</span>`;

          if (this.guessedStates.size === this.totalStates) {
              this.statusDisplay.textContent = "Congratulations! You've guessed all states. The game will reset.";
              setTimeout(() => this.resetGame(), 2000); // Delay reset to show the message
          } else {
              this.startNewRound(data);
          }
      } else {
          const correctAnswer = data.find(state => state.state_code === this.currentTarget);
          this.statusDisplay.innerHTML = `<span class="wrong">Incorrect. The correct answer is <strong>${correctAnswer.state}</strong>, meaning <em>${correctAnswer.meaning}</em>.</span>`;
      }

      this.updateScore();
  }

  startNewRound(data) {
      const remainingStates = data.filter(state => !this.guessedStates.has(state.state_code));
      const randomState = remainingStates[Math.floor(Math.random() * remainingStates.length)];
      this.currentTarget = randomState.state_code;
      this.meaningDisplay.textContent = randomState.meaning;
  }

  updateScore() {
      this.scoreDisplay.textContent = `Score: ${this.score}/${this.totalStates}`;
  }

  resetGame() {
      this.score = 0;
      this.guessedStates.clear();
      this.fetchData(this.select.value); // Restart the game with the selected country
  }
}

customElements.define('country-quiz', CountryQuiz);
export {
  CountryQuiz
}