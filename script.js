class HIITTimer {
    constructor() {
        this.prepTime = 2; // Réduit à 2 secondes
        this.workTime = 30;
        this.restTime = 15;
        this.rounds = 8;
        this.currentRound = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.currentPhase = 'prep'; // 'prep', 'work' ou 'rest'
        this.timeRemaining = 0;
        this.timer = null;
        this.totalTime = 0;
        this.elapsedTime = 0;
        this.exercises = []; // Tableau pour stocker les exercices

        this.initializeElements();
        this.bindEvents();
        this.generateExerciseInputs();
        this.updateDisplay();
        this.updatePhaseLogo();
    }

    initializeElements() {
        this.timeRemainingEl = document.getElementById('timeRemaining');
        this.phaseIndicatorEl = document.getElementById('phaseIndicator');
        this.nextPhaseEl = document.getElementById('nextPhase');
        this.phaseLogoEl = document.getElementById('phaseLogo');
        this.workTimeInput = document.getElementById('workTime');
        this.restTimeInput = document.getElementById('restTime');
        this.roundsInput = document.getElementById('rounds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressFill = document.getElementById('progressFill');
        this.roundCounter = document.getElementById('roundCounter');
        this.timerDisplay = document.querySelector('.timer-display');
        this.exercisesGrid = document.getElementById('exercisesGrid');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Mise à jour des valeurs en temps réel
        this.workTimeInput.addEventListener('input', (e) => {
            this.workTime = parseInt(e.target.value) || 30;
            this.updateDisplay();
        });
        
        this.restTimeInput.addEventListener('input', (e) => {
            this.restTime = parseInt(e.target.value) || 15;
            this.updateDisplay();
        });
        
        this.roundsInput.addEventListener('input', (e) => {
            this.rounds = parseInt(e.target.value) || 8;
            this.updateDisplay();
            this.updateExerciseInputs(); // Mettre à jour les exercices quand le nombre de cycles change
        });
    }

    generateExerciseInputs() {
        this.updateExerciseInputs();
    }

    updateExerciseInputs() {
        this.exercisesGrid.innerHTML = '';
        this.exercises = [];
        
        for (let i = 1; i <= this.rounds; i++) {
            const exerciseInputGroup = document.createElement('div');
            exerciseInputGroup.className = 'exercise-input-group';
            
            const label = document.createElement('label');
            label.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" fill="currentColor"/>
                </svg>
                Exercice ${i}
            `;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Ex: Flexions, Burpees, Pompes...`;
            input.value = this.getDefaultExerciseName(i);
            input.dataset.round = i;
            
            // Stocker l'exercice dans le tableau
            this.exercises[i] = input.value;
            
            // Écouter les changements
            input.addEventListener('input', (e) => {
                this.exercises[i] = e.target.value;
            });
            
            exerciseInputGroup.appendChild(label);
            exerciseInputGroup.appendChild(input);
            this.exercisesGrid.appendChild(exerciseInputGroup);
        }
    }

    getDefaultExerciseName(round) {
        const defaultExercises = [
            'Flexions', 'Burpees', 'Pompes', 'Squats', 'Mountain Climbers',
            'Jumping Jacks', 'Planche', 'Fentes', 'Gainage', 'Burpees',
            'Flexions', 'Burpees', 'Pompes', 'Squats', 'Mountain Climbers',
            'Jumping Jacks', 'Planche', 'Fentes', 'Gainage', 'Burpees'
        ];
        return defaultExercises[(round - 1) % defaultExercises.length];
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            if (this.currentRound === 0) {
                this.currentPhase = 'prep';
                this.timeRemaining = this.prepTime;
                this.totalTime = this.calculateTotalTime();
                this.elapsedTime = 0;
            }
            
            this.runTimer();
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                Reprendre
            `;
            
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentRound = 0;
        this.currentPhase = 'prep';
        this.timeRemaining = 0;
        this.elapsedTime = 0;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
            Démarrer
        `;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.updateDisplay();
        this.timerDisplay.className = 'timer-display';
        this.updatePhaseLogo();
        this.updateExerciseInputs(); // Réinitialiser les exercices
    }

    runTimer() {
        this.timer = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.elapsedTime++;
                this.updateDisplay();
            } else {
                this.nextPhase();
            }
        }, 1000);
    }

    nextPhase() {
        if (this.currentPhase === 'prep') {
            // Fin de la phase de préparation, commencer le premier exercice
            this.currentRound = 1;
            this.currentPhase = 'work';
            this.timeRemaining = this.workTime;
            this.playNotificationSound();
            
        } else if (this.currentPhase === 'work') {
            // Fin de la phase d'exercice, passer à la pause
            this.currentPhase = 'rest';
            this.timeRemaining = this.restTime;
            this.playNotificationSound();
            
        } else {
            // Fin de la phase de pause, passer à l'exercice suivant
            this.currentRound++;
            
            if (this.currentRound > this.rounds) {
                // Entraînement terminé
                this.completeWorkout();
                return;
            }
            
            this.currentPhase = 'work';
            this.timeRemaining = this.workTime;
            this.playNotificationSound();
        }
        
        this.updateDisplay();
    }

    completeWorkout() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor"/>
            </svg>
            Recommencer
        `;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.phaseIndicatorEl.textContent = 'Entraînement Terminé !';
        this.nextPhaseEl.textContent = 'Prochaine étape: Terminé';
        this.timerDisplay.className = 'timer-display';
        
        // Notification de fin
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('HIIT Timer', {
                body: 'Félicitations ! Votre entraînement est terminé.',
                icon: '/favicon.ico'
            });
        }
    }

    playNotificationSound() {
        // Créer un son simple de notification
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    calculateTotalTime() {
        return this.prepTime + (this.workTime + this.restTime) * this.rounds - this.restTime;
    }

    updatePhaseLogo() {
        let logoSvg = '';
        
        if (this.currentPhase === 'prep') {
            // Logo de préparation : Horloge moderne avec aiguilles
            logoSvg = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
            `;
        } else if (this.currentPhase === 'work') {
            // Logo d'exercice : Personne qui court (même que l'input)
            logoSvg = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" fill="currentColor"/>
                </svg>
            `;
        } else if (this.currentPhase === 'rest') {
            // Logo de pause : Coeur pour la récupération
            logoSvg = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
            `;
        } else {
            // Phase par défaut (prêt) : Icône de play
            logoSvg = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
            `;
        }
        
        this.phaseLogoEl.innerHTML = logoSvg;
    }

    updateDisplay() {
        // Mise à jour du temps restant
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeRemainingEl.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Mise à jour de l'indicateur de phase avec le numéro du cycle et le type d'exercice
        if (this.currentPhase === 'prep') {
            this.phaseIndicatorEl.textContent = 'PRÉPARATION';
        } else if (this.currentRound > 0) {
            if (this.currentPhase === 'work') {
                const exerciseName = this.exercises[this.currentRound] || `Exercice ${this.currentRound}`;
                this.phaseIndicatorEl.textContent = `EXERCICE ${this.currentRound}: ${exerciseName}`;
            } else {
                this.phaseIndicatorEl.textContent = `PAUSE ${this.currentRound}`;
            }
        } else {
            this.phaseIndicatorEl.textContent = 'Prêt';
        }
        
        // Mise à jour de la prochaine étape
        this.updateNextPhase();
        
        // Mise à jour du compteur de cycles
        this.roundCounter.textContent = `Cycle ${this.currentRound} / ${this.rounds}`;
        
        // Mise à jour de la barre de progression
        if (this.totalTime > 0) {
            const progress = (this.elapsedTime / this.totalTime) * 100;
            this.progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
        
        // Mise à jour des classes CSS pour les états visuels
        this.timerDisplay.className = 'timer-display';
        if (this.currentPhase === 'prep') {
            this.timerDisplay.classList.add('prep');
        } else if (this.currentRound > 0) {
            this.timerDisplay.classList.add(this.currentPhase);
        }
        
        // Mettre à jour le logo de phase
        this.updatePhaseLogo();
    }

    updateNextPhase() {
        if (this.currentRound === 0) {
            this.nextPhaseEl.textContent = 'Prochaine étape: Prêt';
            return;
        }

        if (this.currentRound > this.rounds) {
            this.nextPhaseEl.textContent = 'Prochaine étape: Terminé';
            return;
        }

        if (this.currentPhase === 'prep') {
            // Actuellement en préparation, la prochaine étape sera le premier exercice
            const exerciseName = this.exercises[1] || 'Exercice 1';
            this.nextPhaseEl.textContent = `Prochaine étape: Exercice 1: ${exerciseName}`;
        } else if (this.currentPhase === 'work') {
            // Actuellement en exercice, la prochaine étape sera une pause
            this.nextPhaseEl.textContent = `Prochaine étape: Pause ${this.currentRound}`;
        } else {
            // Actuellement en pause, la prochaine étape sera un exercice
            if (this.currentRound < this.rounds) {
                const exerciseName = this.exercises[this.currentRound + 1] || `Exercice ${this.currentRound + 1}`;
                this.nextPhaseEl.textContent = `Prochaine étape: Exercice ${this.currentRound + 1}: ${exerciseName}`;
            } else {
                this.nextPhaseEl.textContent = 'Prochaine étape: Terminé';
            }
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Demander la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
        // Notification.requestPermission();
    }
    
    // Créer l'instance du timer HIIT
    const hiitTimer = new HIITTimer();
});
