/**
 * MINESONIC: SIH Hackathon Demo Controller & Explanation Panel Component
 * Controls the 5-Step Presentation Flow and dynamically reveals the AI decision mechanism.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { demoScenarioService } from '../services/demoScenarioService.js';
import { createIcons, icons } from 'lucide';

export class DemoController {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render(currentStepData, isPlaying = false) {
    if (!this.container) return;
    const cur = currentStepData || demoScenarioService.getCurrentStep();

    this.container.innerHTML = `
      <div class="demo-controller-card sonic-glass-panel">
        <div class="demo-ctrl-header">
          <div class="demo-badge-wrap">
            <span class="badge-sih-demo">🏆 SIH 2026 LIVE JURY DEMO</span>
            <h3 class="demo-title">${cur.title}</h3>
          </div>

          <!-- Playback Toolbar -->
          <div class="demo-playback-buttons">
            <button class="btn btn-xs btn-outline btn-demo-step" data-act="RESET" title="Reset to Baseline"><i data-lucide="rotate-ccw" class="icon-xxs"></i> Reset</button>
            <button class="btn btn-xs btn-outline btn-demo-step" data-act="PREV" title="Previous Step"><i data-lucide="skip-back" class="icon-xxs"></i> Prev</button>
            <button class="btn btn-xs ${isPlaying ? 'btn-danger-pulse' : 'btn-primary'} btn-demo-step" data-act="TOGGLE_PLAY">
              <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="icon-xxs"></i> ${isPlaying ? 'Pause Auto' : 'Auto Play'}
            </button>
            <button class="btn btn-xs btn-outline btn-demo-step" data-act="NEXT" title="Next Step"><i data-lucide="skip-forward" class="icon-xxs"></i> Next</button>
          </div>
        </div>

        <!-- 5 Step Stepper -->
        <div class="demo-stepper-bar mt-3">
          ${demoScenarioService.steps.map(s => `
            <button class="demo-step-pill ${s.step === cur.step ? 'active ' + s.color.toLowerCase() : ''}" data-step="${s.step}">
              <span class="step-pill-num">${s.step}</span>
              <span class="step-pill-label">${s.shortLabel}</span>
            </button>
          `).join('')}
        </div>

        <!-- Deep Explainable AI Question & Answer Panel -->
        <div class="demo-explanation-grid mt-4">
          <div class="exp-q-box">
            <div class="exp-q-header">
              <i data-lucide="activity" class="icon-xs text-accent"></i>
              <span>WHAT IS HAPPENING IN THE MINE?</span>
            </div>
            <p class="exp-q-ans">${cur.whatIsHappening}</p>
          </div>

          <div class="exp-q-box">
            <div class="exp-q-header">
              <i data-lucide="cpu" class="icon-xs text-yellow"></i>
              <span>WHAT SENSORS CHANGED?</span>
            </div>
            <p class="exp-q-ans">${cur.whatSensorsChanged}</p>
          </div>

          <div class="exp-q-box">
            <div class="exp-q-header">
              <i data-lucide="brain" class="icon-xs text-purple"></i>
              <span>WHAT IS THE AI DOING?</span>
            </div>
            <p class="exp-q-ans">${cur.whatAiIsDoing}</p>
          </div>

          <div class="exp-q-box">
            <div class="exp-q-header">
              <i data-lucide="trending-up" class="icon-xs text-red"></i>
              <span>WHY IS THE RISK INCREASING?</span>
            </div>
            <p class="exp-q-ans">${cur.whyRiskIsIncreasing}</p>
          </div>
        </div>

        <div class="demo-rec-action-bar mt-3">
          <span class="rec-title"><i data-lucide="shield-alert" class="icon-xs text-red"></i> RECOMMENDED ACTION:</span>
          <strong class="rec-body">${cur.recommendedAction}</strong>
        </div>
      </div>
    `;

    // Attach step click listeners
    this.container.querySelectorAll('.demo-step-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const s = parseInt(e.currentTarget.dataset.step, 10);
        demoScenarioService.setStep(s);
      });
    });

    this.container.querySelectorAll('.btn-demo-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const act = e.currentTarget.dataset.act;
        if (act === 'RESET') demoScenarioService.reset();
        else if (act === 'PREV') demoScenarioService.prevStep();
        else if (act === 'NEXT') demoScenarioService.nextStep();
        else if (act === 'TOGGLE_PLAY') demoScenarioService.toggleAutoPlay();
      });
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
