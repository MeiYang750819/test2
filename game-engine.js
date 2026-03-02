/* ================================================================
   【 ⚙️ GAME ENGINE - 靈魂回歸最終版 】
   ================================================================ */
const GameEngine = {
    state: {
        score: 0,
        items: ['👕 粗製布衣'],
        location: '⛺ 新手村',
        status: '📦 檢整裝備中',
        achievements: [],
        weaponType: null, // 儲存獲得的初始武器名稱
        currentTrial: 0,
        examDate: null,      
        examDateLocked: false,
        resultDate: null,    
        resultDateLocked: false,
        appointmentTime: "2026-03-09 10:00", 
        appointmentLocation: "等待公會發布..."
    },

    // 🏆 戰力階級 - 依照您的設定
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

    // 🛡️ 防具進化路徑
    armorPath: ['👕 粗製布衣', '🧥 強化布衫', '🥋 實習皮甲', '🦺 輕型鎖甲', '🛡️ 鋼鐵重甲', '💠 秘銀胸甲', '🛡️ 聖光戰鎧', '🌟 永恆守護鎧'],
    
    // ⚔️ 武器進化路徑
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
                50% { filter: brightness(2.5); transform: scale(1.1); color: #4ade80; text-shadow: 0 0 15px #4ade80; }
                100% { filter: brightness(1); transform: scale(1); }
            }
            .shiny-effect { animation: shinyUpdate 0.8s ease-in-out; display: inline-block; }
            .game-toast {
                position: fixed; bottom: 20px; right: -300px;
                background: #1a1a1a; color: #efefef; border: 1px solid #fbbf24;
                padding: 12px 20px; border-radius: 8px; z-index: 9999;
                transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 5px 15px rgba(0,0,0,0.5); font-weight: bold;
            }
            .game-toast.show { right: 20px; }
            .progress-fill { background: linear-gradient(90deg, #ff4d4d 0%, #fbbf24 50%, #4ade80 100%) !important; transition: width 0.5s ease; }
        `;
        document.head.appendChild(style);
    },

    // 💰 核心互動：大摺疊、小摺疊、隨機武器
    unlock(event, id, action) {
        if (this.state.achievements.includes(id)) return;
        
        let scoreGain = 0;
        let toastMsg = "";
        let alertMsg = "";
        let shinyTargets = ['score-val']; // 預設閃分數數值

        if (action === 'large_fold') {
            scoreGain = 2;
            alertMsg = `🔔 發現隱藏關卡，冒險積分 +${scoreGain}`;
        } else if (action === 'explore1') {
            scoreGain = 1;
            toastMsg = `✨ 深入探索，冒險積分+1`;
        } else if (action === 'explore2') {
            scoreGain = 1;
            toastMsg = `🧩 探索重要情報，冒險積分 +1`;
        } else if (action === 'random_weapon') {
            scoreGain = 5;
            const weapons = ['🗡️ 精鋼短劍', '🏹 獵人短弓', '🔱 鐵尖長槍'];
            const w = weapons[Math.floor(Math.random() * weapons.length)];
            this.state.weaponType = w;
            this.state.items.push(w);
            toastMsg = `⚔️ 獲得武器：${w}，戰力大幅提升！`;
            shinyTargets.push('items-val'); // 拿到武器也要閃道具欄
        }

        if (alertMsg) alert(alertMsg);

        this.createFloatingText(event, `+${scoreGain}`);
        this.state.achievements.push(id);
        this.state.score += scoreGain;
        this.save();
        
        setTimeout(() => {
            if (toastMsg) this.showToast(toastMsg);
            shinyTargets.forEach(target => this.triggerShiny(target));
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
        }, 3000); // 🎯 3秒消失
    },

    triggerShiny(targetId) {
        const el = document.getElementById(targetId);
        if (el) {
            el.classList.remove('shiny-effect');
            void el.offsetWidth;
            el.classList.add('shiny-effect');
        }
    },

    save() { localStorage.setItem('hero_progress', JSON.stringify(this.state)); },

    updateUI() {
        // 戰力判定 (高往低找)
        const sortedRanks = [...this.ranks].sort((a,b) => b.min - a.min);
        const rank = sortedRanks.find(r => this.state.score >= r.min) || this.ranks[this.ranks.length - 1];

        const rankVal = document.getElementById('rank-val');
        const locVal = document.getElementById('loc-val');
        const itemsVal = document.getElementById('items-val');
        const statusVal = document.getElementById('status-val');
        const scoreVal = document.getElementById('score-val');
        const progVal = document.getElementById('prog-val');

        // 數值更新 (變動才更新)
        if (rankVal && rankVal.innerText !== rank.title) { rankVal.innerText = rank.title; this.triggerShiny('rank-val'); }
        if (locVal && locVal.innerText !== this.state.location) { locVal.innerText = this.state.location; this.triggerShiny('loc-val'); }
        if (itemsVal) itemsVal.innerText = this.state.items.join(' ');
        if (statusVal) statusVal.innerText = this.state.status;
        if (scoreVal) scoreVal.innerText = this.state.score + "分";
        
        const scoreFill = document.getElementById('score-fill');
        if (scoreFill) scoreFill.style.width = Math.min(this.state.score, 100) + "%";

        const baseProg = this.state.currentTrial > 0 ? this.trialsData[this.state.currentTrial].baseProg : 0;
        const currentProg = Math.min(100, baseProg + (this.state.achievements.length * 2));
        if (progVal && progVal.innerText !== currentProg + "%") {
            progVal.innerText = currentProg + "%";
            this.triggerShiny('prog-val');
        }
        
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
            if (this.state.examDateLocked) { d1.disabled = true; b1.innerText = "已鎖定"; b1.disabled = true; }
        }
        const d2 = document.getElementById('input-result-date');
        const b2 = document.getElementById('btn-lock-result');
        if (d2 && b2) {
            d2.value = this.state.resultDate || "";
            if (this.state.resultDateLocked) { d2.disabled = true; b2.innerText = "已鎖定"; b2.disabled = true; }
        }
    },

    lockDate(type) {
        const id = type === 'exam' ? 'input-exam-date' : 'input-result-date';
        const val = document.getElementById(id).value;
        if (!val) { alert("請先選擇日期！"); return; }
        
        const confirmLock = confirm("鎖定就不能更改，確定要鎖定嗎？");
        if (!confirmLock) return;

        if (type === 'exam') { this.state.examDate = val; this.state.examDateLocked = true; }
        else { this.state.resultDate = val; this.state.resultDateLocked = true; }
        this.save(); 
        this.updateUI();
        alert("鎖定就不能更改！");
    },

    completeTrial(event, trialNum) {
        if (this.state.currentTrial >= trialNum) return;
        
        const tData = this.trialsData[trialNum];
        this.state.currentTrial = trialNum;
        this.state.location = tData.loc;
        this.state.score += tData.scoreGain;
        
        // 🎯 升級閃爍：只有數值閃
        this.triggerShiny('loc-val');
        this.triggerShiny('items-val');
        this.triggerShiny('score-val');

        // 防具進化路徑
        const currentArmor = this.state.items.find(i => this.armorPath.includes(i));
        if (currentArmor) {
            const idx = this.armorPath.indexOf(currentArmor);
            if (idx < this.armorPath.length - 1) {
                this.state.items = this.state.items.map(i => i === currentArmor ? this.armorPath[idx + 1] : i);
            }
        }

        // 武器進化路徑 (只有拿到的人才升級)
        if (this.state.weaponType) {
            const nextW = this.weaponPaths[this.state.weaponType];
            if (nextW) {
                this.state.items = this.state.items.map(i => i === this.state.weaponType ? nextW : i);
                this.state.weaponType = nextW;
            }
        }

        this.save();
        this.updateUI();
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
