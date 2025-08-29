class HIITTimer {
    constructor() {
        this.prepTime = 10;
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

        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.timeRemainingEl = document.getElementById('timeRemaining');
        this.phaseIndicatorEl = document.getElementById('phaseIndicator');
        this.nextPhaseEl = document.getElementById('nextPhase');
        this.workTimeInput = document.getElementById('workTime');
        this.restTimeInput = document.getElementById('restTime');
        this.roundsInput = document.getElementById('rounds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressFill = document.getElementById('progressFill');
        this.roundCounter = document.getElementById('roundCounter');
        this.timerDisplay = document.querySelector('.timer-display');
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
        });
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

    updateDisplay() {
        // Mise à jour du temps restant
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeRemainingEl.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Mise à jour de l'indicateur de phase avec le numéro du cycle
        if (this.currentPhase === 'prep') {
            this.phaseIndicatorEl.textContent = 'PRÉPARATION';
        } else if (this.currentRound > 0) {
            this.phaseIndicatorEl.textContent = 
                this.currentPhase === 'work' ? `EXERCICE ${this.currentRound}` : `PAUSE ${this.currentRound}`;
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
            this.nextPhaseEl.textContent = 'Prochaine étape: Exercice 1';
        } else if (this.currentPhase === 'work') {
            // Actuellement en exercice, la prochaine étape sera une pause
            this.nextPhaseEl.textContent = `Prochaine étape: Pause ${this.currentRound}`;
        } else {
            // Actuellement en pause, la prochaine étape sera un exercice
            if (this.currentRound < this.rounds) {
                this.nextPhaseEl.textContent = `Prochaine étape: Exercice ${this.currentRound + 1}`;
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
