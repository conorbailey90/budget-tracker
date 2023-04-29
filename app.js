import { PieChart } from "./pie.js";

const incomeModal = document.querySelector('.income__modal');
const salaryInput = document.querySelector('.salary__input');
const salaryButton = document.querySelector('.salary__apply__button');
const salaryView = document.querySelector('.salary__view');
const editIncomeBtn = document.getElementById('edit__income');
const expensesSectionList = document.querySelector('.expenses__list');
const expenseCategorySelection = document.getElementById('expense__category__select');
const expenseNameInput = document.getElementById('expense__name__input');
const expenseAmountInput = document.getElementById('expense__amount__input');
const expenseModal = document.querySelector('.expenses__modal');
const modalExpenseBtn = document.querySelector('.expenses__modal__submit');
const modalCancelBtn = document.querySelector('.modal__cancel__btn');
const addExpenseBtn = document.getElementById('add__expense');
const totalView = document.querySelector('.total__view');
const riView = document.querySelector('.remaining__income__view');

// Pie Chart 
const pieChart = document.querySelector('.pie__chart__container');
const close = document.querySelector('.close');
const canvas = document.getElementById('c');
const keySection = document.querySelector('.key__list');
const viewChartBtn = document.getElementById('chart__btn');
const bar = document.querySelector('.bar')
let movingChart = false;
let initialChartXPos = 0;
let initialClickXPos = 0;
let initialChartYPos = 0;
let initialClickYPos = 0;

let income = 0;
let remainingIncome = 0;
let expensesTotal = 0;

let budget = {
    "houseing": {},
    "bills": {},
    "transportation": {},
    "food": {},
    "personal": {},
    "entertainment": {},
    "miscellaneous": {}
};

function initialSetup(){
    const array = Object.keys(budget);
    array.forEach(el => {
        let option = document.createElement('option');
        option.value = el;
        option.textContent = el.charAt(0).toUpperCase() + el.slice(1);
        expenseCategorySelection.appendChild(option);
    })
    if(localStorage.getItem('budget')){
        budget = JSON.parse(localStorage.getItem('budget'));
        resetExpenses();
        console.log(budget);
    }
    if(localStorage.getItem('income')){
        income = +localStorage.getItem('income');
        salaryView.innerText = `${income.toLocaleString('en-US')}`;
        resetExpenses();
    }
}

initialSetup();

function moveChart(){
    movingChart = true;
}

function resetExpenses(){
    expensesTotal = 0;
    expensesSectionList.innerHTML = '';
    for(let category in budget){
        let expenseArray = [];
        for(let expense in budget[category]){
            expenseArray.push([expense, budget[category][expense]]);
        }
        expenseArray.sort((a, b) => {
            return b[1] - a[1];
        });
        appendExpenses(category, expenseArray);
    }
    calculateExpensesTotal();
    saveBudget();
}

function appendExpenses(category, expenseArray){
    if(expenseArray.length > 0){
        let categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category[0].toUpperCase() + category.slice(1).toLowerCase();
        categoryHeader.className = 'category__header';
        expensesSectionList.appendChild(categoryHeader);
        expenseArray.forEach(expense => {
            let li = document.createElement('li');
            for(let i = 0; i < 3; i++){
                let liDiv = document.createElement('div');
                liDiv.classList.add(`li__${i}`);
                li.appendChild(liDiv);
            }
            let expenseName = document.createElement('h5');
            expenseName.innerText = `${expense[0].charAt(0).toUpperCase() + expense[0].slice(1)}`;
            li.querySelector(`.li__0`).appendChild(expenseName);

            let expenseAmount = document.createElement('h5');
            expenseAmount.innerText = expense[1].toLocaleString();
            li.querySelector(`.li__1`).appendChild(expenseAmount);

            let deleteDiv = document.createElement('div');
            deleteDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="#FFFFFF" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>';
            li.querySelector(`.li__2`).appendChild(deleteDiv);
            deleteDiv.addEventListener('click', () => {
                if(confirm(`Are you sure you want to delete ${expense[0]}?`)){
                    delete(budget[category][expense[0]]);
                    resetExpenses();
                }
            })
            expensesSectionList.appendChild(li);
        })
    }
    expenseModal.classList.remove('active');
}

function calculateExpensesTotal(){
    expensesTotal = 0;
    for(let category in budget){
        for(let expense in budget[category]){
            expensesTotal += budget[category][expense];
        }
    }   
    totalView.innerText = expensesTotal.toLocaleString();
    remainingIncome = income - expensesTotal;
    riView.innerText = remainingIncome.toLocaleString();
    remainingIncome < 0 ? riView.classList.add('negative') : riView.classList.remove('negative');
}

let categoryPercentages;

function calculatePercentages(){
    categoryPercentages = {};
    calculateExpensesTotal();
    for(let category in budget){
        let catTotal = 0;
        for(let expense in budget[category]){
            catTotal += budget[category][expense];
        }
        categoryPercentages[category] = ((catTotal / (expensesTotal + (income - expensesTotal))) * 100).toFixed(2);
    }
    categoryPercentages['remaining income'] = ((remainingIncome/ income) * 100).toFixed(2);
    createPieChart(categoryPercentages);
}

function createPieChart(data){
    let pieChart = new PieChart(data, canvas, keySection);
}

function saveBudget(){
    // Save to local storage
    localStorage.setItem('budget', JSON.stringify(budget));
}

salaryButton.addEventListener('click', () => {
    income = salaryInput.value == '' ? 0 : +salaryInput.value;
    localStorage.setItem('income', income);
    salaryView.innerText = `${income.toLocaleString('en-US')}`;
    incomeModal.classList.remove('active');
    calculateExpensesTotal();
})

modalExpenseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try{
        let expenseName = expenseNameInput.value;
        if(expenseName.trim() == ''){
            alert('Please enter expense name.');
            return;
        }
        let category = expenseCategorySelection.value;
        let expenseAmount = +expenseAmountInput.value;
        budget[category][`${expenseName.toLowerCase()}`] = expenseAmount;
        resetExpenses();
        // Reset modal
        expenseNameInput.value = '';
        expenseAmountInput.value = '';
    }catch(err){
        alert(err)
    }
    
})

addExpenseBtn.addEventListener('click', () => {
    expenseModal.classList.add('active');
})

editIncomeBtn.addEventListener('click', () => {
    incomeModal.classList.add('active');
})

modalCancelBtn.addEventListener('click', () => {
    expenseModal.classList.remove('active')
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
})

viewChartBtn.addEventListener('click', () => {
    calculatePercentages();
    pieChart.classList.add('active');
})

close.addEventListener('click', () => {
    pieChart.classList.remove('active');
})

bar.addEventListener('mousedown', (e) => {
    initialChartXPos = pieChart.getBoundingClientRect().left;
    initialChartYPos = pieChart.getBoundingClientRect().top;
    initialClickXPos = e.clientX;
    initialClickYPos = e.clientY;
    movingChart = true;
})

window.addEventListener('mousemove', (e) => {
    if(movingChart){
        pieChart.style.transform = `translate3d(${e.clientX - (initialClickXPos - initialChartXPos )}px, ${e.clientY - (initialClickYPos - initialChartYPos )}px, 0)`;
    }
})

window.addEventListener('mouseup', (e) => {
    movingChart = false;
})