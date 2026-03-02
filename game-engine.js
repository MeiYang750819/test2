/* ================================================================
   【 ⚙️ GAME ENGINE - 成就加分與通知完整版 】
   ================================================================ */
const GameEngine = {
    state: {
        score: 0,
        items: ['👕 粗製布衣'],
        location: '⛺ 新手村',
        status: '📦 檢整裝備中',
        achievements: [],    // 儲存已獲得的成就 ID
        weaponType: null,
        currentTrial: 0,
        examDate: null,      
        examDateLocked: false,
        resultDate: null,    
        resultDateLocked: false,
        appointmentTime: "等待公會發布...", 
        appointmentLocation: "等待公會發布..."
    },

    // 🏆 戰力階級 (包含 💀 骷顱頭)
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

    // 🚀 初始化
    init() {
        try {
            const saved = localStorage.getItem('hero_progress');
            if (saved) { 
                this.state = Object.assign({}, this.state, JSON.parse(saved));
            }
        } catch (e) {
            localStorage.removeItem('hero_progress');
        }
        this.injectNotificationCSS();
        setTimeout(() => { this.updateUI(true); }, 50);
        setInterval(() => this.checkLateWarning(), 600000);
    },

    save() { localStorage.setItem('hero_progress', JSON.stringify(this.state)); },

    reset() {
        localStorage.removeItem('hero_progress');
        location.reload();
    },

    // 🔔 注入滑出通知的 CSS
    injectNotificationCSS() {
        if (document.getElementById('notify-style')) return;
        const style = document.createElement('style');
        style.id = 'notify-style';
        style.innerHTML = `
            .game-notify {
                position: fixed; top: 20px; right: -300px; 
                background: rgba(35, 42, 53, 0.95);
                color: #4ade80; border: 1px solid #4ade80;
                padding: 15px 25px; border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                z-index: 9999; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-weight: bold; display: flex; align-items: center; gap: 10px;
            }
            .game-notify.show { right: 20px; }
            .game-notify.bonus { border-color: #fbbf24; color: #fbbf24; }
        `;
        document.head.appendChild(style);
    },

    // 📣 顯示滑出通知
    showNotification(msg, isBonus = false) {
        const notify = document.createElement('div');
        notify.className = `game-notify ${isBonus ? 'bonus' : ''}`;
        notify.innerHTML = msg;
        document.body.appendChild(notify);
        setTimeout(() => notify.classList.add('show'), 100);
        setTimeout(() => {
            notify.classList.remove('show');
            setTimeout(() => notify.remove(), 500);
        }, 5000);
    },

    // 🏅 增加成就加分項目
    addAchievement(id, bonusScore, msg) {
        if (this.state.achievements.includes(id)) return;
        this.state.achievements.push(id);
        this.state.score += bonusScore;
        this.showNotification(msg, true);
        this.save();
        this.updateUI();
    },

    // 📌 日期鎖定
    lockDate(type) {
        const id = type === 'exam' ? 'input-exam-date' : 'input-result-date';
        const val = document.getElementById(id).value;
        if (!val) { alert("請先選擇日期！"); return; }
        if (type === 'exam') {
            this.state.examDate = val;
            this.state.examDateLocked = true;
        } else {
            this.state.resultDate = val;
            this.state.resultDateLocked = true;
        }
        this.save();
        this.updateUI();
        this.showNotification("📌 日期已鎖定，鑑定中！");
    },

    // 📌 申請更改
    requestChange() {
        const val = document.getElementById('input-change-date').value;
        if (!val) { alert("請選擇欲更改的日期！"); return; }
        alert("🚨 已送出申請，請私訊人資承辦，核准後將為您解鎖，會因此扣分喔！");
        const btn = document.getElementById('btn-lock-change');
        if (btn) {
            btn.disabled = true;
            btn.innerText = "申請";
            btn.style.opacity = "0.5";
        }
    },

    checkLateWarning() {
        if (this.state.examDate && this.state.currentTrial < 3) {
            const today = new Date().toISOString().split('T')[0];
            if (today > this.state.examDate) {
                const statusSpan = document.getElementById('dyn-status');
                if (statusSpan) statusSpan.innerHTML = `<span style="color:#ff8a8a;">💀 警告：體檢延宕</span>`;
                return true;
            }
        }
        return false;
    },

    // 🔒 報到日 08:00 開放檢查
    canUnlockTrial5() {
        if (!this.state.appointmentTime || this.state.appointmentTime.includes("等待")) {
            return { can: false, reason: "⚠️ 尚未發布報到時間，請聯繫人資。" };
        }
        const now = new Date();
        const aptDate = new Date(this.state.appointmentTime);
        const openTime = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), 8, 0, 0);
        if (now < openTime) {
            return { can: false, reason: `⚠️ 任務尚未開啟。\n請於報到日 (${aptDate.toLocaleDateString()}) 早上 08:00 後操作。` };
        }
        return { can: true };
    },

    completeTrial(event, trialNum) {
        if (this.state.currentTrial >= trialNum) return;
        if (trialNum > 1 && this.state.currentTrial < trialNum - 1) {
            alert("⚠️ 請按順序完成試煉！"); return;
        }
        if (trialNum === 5) {
            const check = this.canUnlockTrial5();
            if (!check.can) { alert(check.reason); return; }
        }

        const tData = this.trialsData[trialNum];
        this.state.currentTrial = trialNum;
        this.state.location = tData.loc;
        this.state.score += tData.scoreGain;
        
        // 防具升級
        const currentArmor = this.state.items.find(i => this.armorPath.includes(i));
        if (currentArmor) {
            const idx = this.armorPath.indexOf(currentArmor);
            if (idx < this.armorPath.length - 1) {
                this.state.items = this.state.items.map(i => i === currentArmor ? this.armorPath[idx + 1] : i);
            }
        }

        // 武器升級
        if (trialNum >= 3 && this.state.weaponType) {
            const nextW = this.weaponPaths[this.state.weaponType];
            if (nextW) {
                this.state.items = this.state.items.map(i => i === this.state.weaponType ? nextW : i);
                this.state.weaponType = nextW; 
            }
        }

        this.save();
        this.updateUI(true);
        this.showNotification(`⚔️ 通關：${tData.loc}`);
    },

    updateUI(isInit = false) {
        const rank = this.ranks.find(r => this.state.score >= r.min) || this.ranks[this.ranks.length - 1];
        const rEl = document.getElementById('rank-text');
        const sEl = document.getElementById('status-tag');
        if (rEl) rEl.innerHTML = `<span style="color:#fbbf24;">戰力：</span><span>${rank.title}</span>　｜　<span style="color:#fbbf24;">關卡：</span><span>${this.state.location}</span>`;
        if (sEl) sEl.innerHTML = `<span style="color:#8ab4f8;">道具：</span><span>${this.state.items.join(' ')}</span>　｜　<span style="color:#8ab4f8;">狀態：</span><span id="dyn-status">${this.state.status}</span>`;
        
        const scoreText = document.getElementById('score-text');
        if (scoreText) scoreText.innerText = this.state.score + "分";
        
        const scoreFill = document.getElementById('score-fill');
        if (scoreFill) scoreFill.style.width = Math.min(this.state.score, 100) + "%";

        const bonus = this.state.achievements.length * 2; // 每個成就額外加 2% 進度
        const baseProg = this.state.currentTrial > 0 ? this.trialsData[this.state.currentTrial].baseProg : 0;
        const currentProg = Math.min(100, baseProg + bonus);
        
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

    updateButtonStyles() {
        const trials = [1, 2, 3, 4, 5, 6];
        trials.forEach(n => {
            const btn = document.getElementById(`btn-trial-${n}`);
            if (!btn) return;
            if (this.state.currentTrial >= n) {
                btn.disabled = true;
                btn.style.opacity = "0.6";
                btn.innerText = n === 3 ? "📝 已提交裝備" : n === 6 ? "👑 已完成榮耀" : "✓ 已完成試煉";
            }
        });
    }
};
window.addEventListener('load', () => GameEngine.init());
