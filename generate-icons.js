const { createCanvas } = require('canvas');
const fs = require('fs');

function generateAppIcon() {
    const width = 832;
    const height = 516;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#1890ff';
    ctx.fillRect(0, 0, width, height);

    // 日历图标
    ctx.fillStyle = 'white';
    const centerX = width / 2;
    const centerY = height / 2;
    const calendarWidth = 300;
    const calendarHeight = 350;

    // 日历主体
    ctx.fillRect(
        centerX - calendarWidth / 2,
        centerY - calendarHeight / 2,
        calendarWidth,
        calendarHeight
    );

    // 日历顶部
    ctx.fillStyle = '#1890ff';
    ctx.fillRect(
        centerX - calendarWidth / 2,
        centerY - calendarHeight / 2,
        calendarWidth,
        60
    );

    // 日历格子线条
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 2;

    // 横线
    for (let i = 1; i < 5; i++) {
        const y = centerY - calendarHeight / 2 + 60 + i * (calendarHeight - 60) / 5;
        ctx.beginPath();
        ctx.moveTo(centerX - calendarWidth / 2, y);
        ctx.lineTo(centerX + calendarWidth / 2, y);
        ctx.stroke();
    }

    // 竖线
    for (let i = 1; i < 7; i++) {
        const x = centerX - calendarWidth / 2 + i * calendarWidth / 7;
        ctx.beginPath();
        ctx.moveTo(x, centerY - calendarHeight / 2 + 60);
        ctx.lineTo(x, centerY + calendarHeight / 2);
        ctx.stroke();
    }

    // 保存图标
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./icon.png', buffer);
}

generateAppIcon();