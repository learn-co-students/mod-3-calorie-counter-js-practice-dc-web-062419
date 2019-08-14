document.addEventListener("DOMContentLoaded", () => {
    
    const newCalorieForm = document.getElementById("new-calorie-form");
    const bmrForm = document.getElementById("bmr-calulator");
    const progBar = document.querySelector("progress")
    const editForm = document.getElementById("edit-calorie-form")
    editForm.addEventListener("submit", (f) => submitEdit(f))

    newCalorieForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const entry = {
            api_v1_calorie_entry: {
                calorie: e.target[0].value,
                note: e.target[1].value
            }
        }
        postFetch(entry).then(data => {
            renderRecord(data)
            newCalorieForm.reset()
        })
    })

    bmrForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const weight = Number(e.target[0].value)
        const height = Number(e.target[1].value)
        const age = Number(e.target[2].value)
        const lowerRangeEl = document.getElementById("lower-bmr-range")
        const upperRangeEl = document.getElementById("higher-bmr-range")
        const lowerRange = Math.round(655 + (4.35 * weight) + (4.7 * height) - (4.7 * age))
        const upperRange = Math.round(66 + (6.23 * weight) + (12.7 * height) - (6.8 * age))

        lowerRangeEl.innerText = lowerRange
        upperRangeEl.innerText = upperRange
        progBar.max = (lowerRange + upperRange)/2
    })

    function renderRecord(data){
        const id = data.id
        const listUl = document.getElementById("calories-list")

        const newLi = document.createElement("li")
        const dGrid = document.createElement("div")
        const dCal = document.createElement("div")
        const dNote = document.createElement("div")
        const dList = document.createElement("div")
        const editBttn = document.createElement("a")
        const deleteBttn = document.createElement("a")

        newLi.className = "calories-list-item"
        newLi.id = id
        dGrid.className = "uk-grid"
        dCal.className = "uk-width-1-6"
        dNote.className = "uk-width-4-5"
        dList.className = "list-item-menu"
        editBttn.className = "edit-button"

        editBttn.setAttribute("uk-icon", "icon: pencil")
        editBttn.setAttribute("uk-toggle", "target: #edit-form-container")
        deleteBttn.className = "delete-button"
        deleteBttn.setAttribute("uk-icon", "icon: trash")

        dCal.innerHTML = `<strong>${data.calorie}</strong> <span>kcal</span>`
        dNote.innerHTML = `<em class='uk-text-meta'>${data.note}</em>`

        listUl.insertBefore(newLi, listUl.childNodes[0] || null)

        newLi.appendChild(dGrid)
        dGrid.appendChild(dCal)
        dGrid.appendChild(dNote)
        newLi.appendChild(dList)
        dList.appendChild(editBttn)
        dList.appendChild(deleteBttn)

        changeProgress(data.calorie)
        
        deleteBttn.addEventListener("click", () => {deleteRecord(id, newLi)})
        editBttn.addEventListener("click", (e) => {setModalFields(e)})
    }

    function deleteRecord(id, newLi){
        deleteFetch(id)
        .then(data => {
            changeProgress(-data.calorie)
            newLi.remove()
        })
    }

    function setModalFields(e) {
        const liToEdit = e.currentTarget.parentElement.parentElement
        const idToEdit = liToEdit.id
        const dCalToEdit = liToEdit.querySelector(".uk-width-1-6")
        const dNoteToEdit = liToEdit.querySelector(".uk-width-4-5")
        const calNum = Number(dCalToEdit.querySelector("strong").innerText)
        const noteText = dNoteToEdit.querySelector("em").innerText
        editForm.querySelector("input.uk-input").value = calNum
        editForm.querySelector("textarea.uk-textarea").value = noteText
        editForm.dataset.id = idToEdit
        editForm.dataset.calOriginal = calNum
    }

    const submitEdit = (f) => {
        f.preventDefault()
        const idToEdit = f.target.dataset.id
        const calOriginal = Number(f.target.dataset.calOriginal)
        const liToEdit = document.getElementById(idToEdit)
        const dCalToEdit = liToEdit.querySelector(".uk-width-1-6")
        const dNoteToEdit = liToEdit.querySelector(".uk-width-4-5")
        updates = {
            api_v1_calorie_entry: {
                calorie: Number(f.target[0].value),
                note: f.target[1].value
            }
        }
        editFetch(idToEdit, updates)
        .then(newData => {
            changeProgress(-calOriginal)
            changeProgress(newData.calorie)
            dCalToEdit.innerHTML = `<strong>${newData.calorie}</strong> <span>kcal</span>`
            dNoteToEdit.innerHTML = `<em class='uk-text-meta'>${newData.note}</em>`
            editForm.parentElement.parentElement.style="display: none"
        })

    }

    function changeProgress(changeNum){
        initialVal = progBar.value
        progBar.value = initialVal + changeNum
    }

    const editFetch = (idToEdit, updates) => {
        return fetch(`http://localhost:3000/api/v1/calorie_entries/${idToEdit}`, {
            method: "PATCH",
            headers: {"Content-Type":"application/json",
                        Accept: "application/json"},
            body: JSON.stringify(updates)
        })
        .then(resp => resp.json())
    }

    const postFetch = (entry) => {
        return fetch("http://localhost:3000/api/v1/calorie_entries", {
            method: "POST",
            headers: {"Content-Type":"application/json",
                        Accept: "application/json"},
            body: JSON.stringify(entry)
        })
        .then(resp => resp.json())
    }

    const deleteFetch = (id) => {
        return fetch(`http://localhost:3000/api/v1/calorie_entries/${id}`, {
            method: "DELETE",
            headers: {"Content-Type":"application/json",
                        Accept: "application/json"}
        })
        .then(resp => resp.json())
    }
})