/* ================================================================
   【 ⚙️ GAME ENGINE - 最終完整版 】
   ================================================================ */
const GameEngine = {
    state: {
        score: 0,
        items: ['👕 粗製布衣'],
        location: '⛺ 新手村',
        status: '📦 檢整裝備中',
        achievements: [],
        weaponType: null,
        currentTrial: 0,
        examDate: null,      
        examDateLocked: false,
        resultDate: null,    
        resultDateLocked: false,
        appointmentTime: "2026-03-09 10:00", // 預設時間，後台可覆寫
        appointmentLocation: "等待公會發布..."
    },

    ranks: [
        { min: 101, title: "💎 SS級 神話級玩家" },
        { min: 96,  title: "🌟 S級 傳說級玩家" },
        { min: 80,  title: "🟢 A級 菁英玩家" },
        { min: 60,  title: "🥇 B級 穩健玩家" },
        { min: 40,  title: "🥈 C級 潛力玩家" },
        { min: 30,  title: "🥉 D級 基礎學徒" },
        { min: 20,  title: "💀 E級 建議汰換" }, 
        { min: 2,   title: "🌱 實習小萌新" },
        { min: 0,   title: "🥚 報到新手村" }
    ],

    armorPath: ['👕 粗製布衣', '🧥 強化布衫', '🥋 實習皮甲', '🦺 輕型鎖甲', '🛡️ 鋼鐵重甲', '💠 秘銀胸甲', '🛡️ 聖光戰鎧', '🌟 永恆守護鎧'],
    weaponPaths: {
        '🗡️ 精鋼短劍': '⚔️ 騎士長劍', '⚔️ 騎士長劍': '⚔️ 破甲重劍', '⚔️ 破甲重劍': '🗡️ 聖光戰劍', '🗡️ 聖光戰劍': '👑 王者之聖劍',
        '🏹 獵人短弓': '🏹 精靈長弓', '🏹 精靈長弓': '🏹 迅雷連弓', '🏹 迅雷連弓': '🏹 追風神弓', '🏹 追風神弓': '☄️ 破曉流星弓',
        '🔱 鐵尖長槍': '🔱 鋼鐵戰矛', '🔱 鋼鐵戰矛': '🔱 破陣重矛', '🔱 破陣重矛': '🔱 龍膽銀槍', '🔱 龍膽銀槍': '🐉 滅世龍吟槍'
    },

    trialsData: {
        1: { baseProg: 10, loc: '🏰 登錄公會', scoreGain: 5 },
        2: { baseProg: 25, loc: '📁 裝備盤點', scoreGain: 5 },
        3: { baseProg: 40, loc: '🛡️ 裝備鑑定所', scoreGain: 10 },
        4: { baseProg: 60, loc: '🎒 出征準備營', scoreGain: 10 },
        5: { baseProg: 80, loc: '💼 契約祭壇', scoreGain: 10 },
        6: { baseProg: 90, loc: '👑 榮耀殿堂', scoreGain: 10 }
    },

    init() {
        try {
            const saved = localStorage.getItem('hero_progress');
            if (saved) { this.state = Object.assign({}, this.state, JSON.parse(saved)); }
        } catch (e) { localStorage.removeItem('hero_progress'); }
        this.injectGlobalCSS();
        setTimeout(() => { this.updateUI(); }, 50);
    },

    injectGlobalCSS() {
        if (document.getElementById('game-fx-style')) return;
        const style = document.createElement('style');
        style.id = 'game-fx-style';
        style.innerHTML = `
            @keyframes floatUp {
                0% { opacity: 0; transform: translateY(0) scale(0.5); }
                20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                100% { opacity: 0; transform: translateY(-60px) scale(1); }
            }
            .floating-text {
                position: fixed; pointer-events: none; color: #fbbf24;
                font-weight: bold; font-size: 28px; text-shadow: 0 0 10px rgba(251,191,36,0.8);
                z-index: 10000; animation: floatUp 1.5s forwards;
            }
            @keyframes shinyUpdate {
                0% { filter: brightness(1); transform: scale(1); }
                50% { filter: brightness(1.8); transform: scale(1.05); color: #4ade80; }
                100% { filter: brightness(1); transform: scale(1); }
            }
            .shiny-effect { animation: shinyUpdate 0.8s ease-in-out; }
            .game-toast {
                position: fixed; bottom: 20px; right: -300px;
                background: #1a1a1a; color: #efefef; border: 1px solid #fbbf24;
                padding: 12px 20px; border-radius: 8px; z-index: 9999;
                transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 5px 15px rgba(0,0,0,0.5); font-weight: bold;
            }
            .game-toast.show { right: 20px; }
        `;
        document.head.appendChild(style);
    },

    unlock(event, id, action, scoreGain) {
        if (this.state.achievements.includes(id)) return;
        
        let toastMsg = "";
        
        if (action === 'random_weapon') {
            const weapons = ['🗡️ 精鋼短劍', '🏹 獵人短弓', '🔱 鐵尖長槍'];
            const w = weapons[Math.floor(Math.random() * weapons.length)];
            this.state.weaponType = w;
            this.state.items.push(w);
            toastMsg = `⚔️ 獲得武器：${w}，戰力大幅提升！`;
        } else if (action === 'large_fold') {
            alert(`🔔 發現隱藏關卡，冒險積分 +${scoreGain}`);
            toastMsg = `✨ 成功探索重要情報，冒險積分 +${scoreGain}`;
        } else {
            toastMsg = `✨ 深入探索，冒險積分+${scoreGain}`;
        }

        this.createFloatingText(event, `+${scoreGain}`);
        this.state.achievements.push(id);
        this.state.score += scoreGain;
        this.save();
        
        setTimeout(() => {
            this.showToast(toastMsg);
            this.triggerShiny();
            this.updateUI();
        }, 1000);
    },

    createFloatingText(e, text) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    },

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'game-toast';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    },

    triggerShiny() {
        const targets = ['rank-text', 'score-text', 'status-tag'];
        targets.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('shiny-effect');
                void el.offsetWidth;
                el.classList.add('shiny-effect');
            }
        });
    },

    save() { localStorage.setItem('hero_progress', JSON.stringify(this.state)); },

    updateUI() {
        const rank = this.ranks.find(r => this.state.score >= r.min) || this.ranks[this.ranks.length - 1];
        const rEl = document.getElementById('rank-text');
        const sEl = document.getElementById('status-tag');
        if (rEl) rEl.innerHTML = `<span style="color:#fbbf24;">戰力：</span><span>${rank.title}</span>　｜　<span style="color:#fbbf24;">關卡：</span><span>${this.state.location}</span>`;
        if (sEl) sEl.innerHTML = `<span style="color:#8ab4f8;">道具：</span><span>${this.state.items.join(' ')}</span>　｜　<span style="color:#8ab4f8;">狀態：</span><span id="dyn-status">${this.state.status}</span>`;
        
        const scoreEl = document.getElementById('score-text');
        if (scoreEl) scoreEl.innerText = this.state.score + "分";
        const scoreFill = document.getElementById('score-fill');
        if (scoreFill) scoreFill.style.width = Math.min(this.state.score, 100) + "%";

        const baseProg = this.state.currentTrial > 0 ? this.trialsData[this.state.currentTrial].baseProg : 0;
        const currentProg = Math.min(100, baseProg + (this.state.achievements.length * 2));
        const progVal = document.getElementById('prog-val');
        if (progVal) progVal.innerText = currentProg + "%";
        const progFill = document.getElementById('prog-fill');
        if (progFill) progFill.style.width = currentProg + "%";

        this.updateDateControls();
        const timeEl = document.getElementById('dyn-apt-time');
        if (timeEl) timeEl.innerText = this.state.appointmentTime;
        this.updateButtonStyles();
    },

    updateDateControls() {
        const d1 = document.getElementById('input-exam-date');
        const b1 = document.getElementById('btn-lock-exam');
        if (d1 && b1) {
            d1.value = this.state.examDate || "";
            if (this.state.examDateLocked) { d1.disabled = true; b1.innerText = "鎖定"; b1.disabled = true; }
        }
        const d2 = document.getElementById('input-result-date');
        const b2 = document.getElementById('btn-lock-result');
        if (d2 && b2) {
            d2.value = this.state.resultDate || "";
            if (this.state.resultDateLocked) { d2.disabled = true; b2.innerText = "鎖定"; b2.disabled = true; }
        }
    },

    lockDate(type) {
        const id = type === 'exam' ? 'input-exam-date' : 'input-result-date';
        const val = document.getElementById(id).value;
        if (!val) return;
        if (type === 'exam') { this.state.examDate = val; this.state.examDateLocked = true; }
        else { this.state.resultDate = val; this.state.resultDateLocked = true; }
        this.save(); this.updateUI();
    },

    requestChange() {
        const val = document.getElementById('input-change-date').value;
        if (!val) return;
        alert("🚨 已送出申請，請私訊人資承辦，核准後將為您解鎖，會因此扣分喔！");
        const btn = document.getElementById('btn-lock-change');
        if (btn) { btn.disabled = true; btn.innerText = "申請"; btn.style.opacity = "0.5"; }
    },

    canUnlockTrial5() {
        if (!this.state.appointmentTime || this.state.appointmentTime.includes("等待")) return { can: false, reason: "⚠️ 尚未發布報到時間。" };
        const now = new Date();
        const aptDate = new Date(this.state.appointmentTime);
        const openTime = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), 8, 0, 0);
        if (now < openTime) return { can: false, reason: `⚠️ 請於報到日 (${aptDate.toLocaleDateString()}) 08:00 後操作。` };
        return { can: true };
    },

    completeTrial(event, trialNum) {
        if (this.state.currentTrial >= trialNum) return;
        if (trialNum === 5 && !this.canUnlockTrial5().can) { alert(this.canUnlockTrial5().reason); return; }
        const tData = this.trialsData[trialNum];
        this.state.currentTrial = trialNum;
        this.state.location = tData.loc;
        this.state.score += tData.scoreGain;
        this.save(); this.updateUI();
    },

    updateButtonStyles() {
        const trials = [1, 2, 3, 4, 5, 6];
        trials.forEach(n => {
            const btn = document.getElementById(`btn-trial-${n}`);
            if (!btn) return;
            if (this.state.currentTrial >= n) {
                btn.disabled = true;
                btn.innerText = n === 3 ? "📝 已提交裝備" : n === 6 ? "👑 已完成榮耀" : "✓ 已完成試煉";
            }
        });
    }
};
window.addEventListener('load', () => GameEngine.init());
