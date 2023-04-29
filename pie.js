const randomHexColorCode = () => {
    return "#" + Math.random().toString(16).slice(2, 8)
};

class PieChart{
    constructor(data, canvas, keySection){
        this.data = data;
        this.dataKeys = [...Object.keys(data)];
        this.dataValues = [...Object.values(data)];
        console.log(this.dataValues)
        this.canvas = canvas;
        this.keySection = keySection;
        this.generatePie(this.dataValues);
    }

    generatePie(data){
        // Canvas setup
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 300 * window.devicePixelRatio;
        this.canvas.height = 300 * window.devicePixelRatio;
        this.canvas.style.height = '300px'
        this.canvas.style.height = '300px';

        this.total = this.dataValues.reduce( (total, value) => {
            console.log(total)
            return +total + +value
        }, 0);

        console.log(this.total)

        this.startAngle = 0; 
        this.radius = 250;
        this.cx = this.canvas.width / 2; // Center X
        this.cy = this.canvas.height / 2; // Center Y
        this.key = []
        this.dataValues.forEach((value, idx) => {
            //set the styles before beginPath
            this.ctx.fillStyle = randomHexColorCode();
            this.ctx.lineWidth = 10;
            this.ctx.strokeStyle = '#161616';
            this.ctx.beginPath();

            // Key
            this.key.push([this.dataKeys[idx], +value, this.ctx.fillStyle ]);
            
            // draw the pie wedges
            this.endAngle = ((value / this.total) * Math.PI * 2) + this.startAngle;
            this.ctx.moveTo(this.cx, this.cy);
            this.ctx.arc(this.cx, this.cy, this.radius, this.startAngle, this.endAngle, false);
            this.ctx.lineTo(this.cx, this.cy);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
            
            // midpoint between the two angles
            // 1.5 * radius is the length of the Hypotenuse
            this.theta = (this.startAngle + this.endAngle) / 2;
            this.deltaY = Math.sin(this.theta) * 1.5 * this.radius;
            this.deltaX = Math.cos(this.theta) * 1.5 * this.radius;
            /***
            SOH  - sin(angle) = opposite / hypotenuse
                              = opposite / 1px
            CAH  - cos(angle) = adjacent / hypotenuse
                              = adjacent / 1px
            TOA
            ***/
            this.startAngle = this.endAngle;
        })

        this.generateKey(this.key);
    }

    generateKey(data){
        this.keySection.innerHTML = '';
        data.forEach(item => {
            if(+item[1] > 0){
                let li = document.createElement('li');
                li.classList.add('key__item');
    
                let color = document.createElement('div');
                color.classList.add('color__block')
                color.style.backgroundColor = item[2];
    
                let p = document.createElement('p');
                p.classList.add('.key__text')
                p.textContent = `${item[0].charAt(0).toUpperCase() + item[0].slice(1)}: ${item[1]}%`;
    
                li.append(color, p);
                this.keySection.appendChild(li);
            }
           
        })
    }
}

export {
    PieChart
}