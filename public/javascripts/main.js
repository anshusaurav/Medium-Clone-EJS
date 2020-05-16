let clearElem = document.querySelector('.clear-anchor');
clearElem.addEventListener('click', function(event){
    let parentFormElem = event.target.closest('form');
    // console.log(parentFormElem);
    parentFormElem.reset();
})
