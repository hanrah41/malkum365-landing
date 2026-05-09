// 파일명: C:\malkum365-landing\admin.js

const customerList = document.getElementById("customerList");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const saveMessage = document.getElementById("saveMessage");

let selectedCustomer = null;

/* =========================
   샘플 leads 데이터
========================= */

let leads = JSON.parse(localStorage.getItem("malkum_leads")) || [];

/* =========================
   notes 데이터
========================= */

let notes = JSON.parse(localStorage.getItem("malkum_notes")) || [];

/* =========================
   고객 리스트 출력
========================= */

function renderCustomerList(){

    customerList.innerHTML = "";

    if(leads.length === 0){

        customerList.innerHTML = `
            <div class="customer-item">
                등록된 상담 신청이 없습니다.
            </div>
        `;

        return;
    }

    leads.forEach((customer, index)=>{

        const div = document.createElement("div");

        div.className = "customer-item";

        div.innerHTML = `
            <div class="customer-name">
                ${customer.name || "이름 없음"}
            </div>

            <div class="customer-phone">
                ${customer.phone || "-"}
            </div>

            <div class="customer-date">
                ${customer.date || ""}
            </div>
        `;

        div.addEventListener("click", ()=>{

            document
                .querySelectorAll(".customer-item")
                .forEach(item=>item.classList.remove("active"));

            div.classList.add("active");

            selectedCustomer = customer;

            customerName.textContent = customer.name || "-";
            customerPhone.textContent = customer.phone || "-";

            loadCustomerNote(customer.id);
        });

        customerList.appendChild(div);

    });

}

/* =========================
   메모 불러오기
========================= */

function loadCustomerNote(customerId){

    const note = notes.find(
        item => item.customer_id === customerId
    );

    if(note){

        noteInput.value = note.memo;

    }else{

        noteInput.value = "";
    }

}

/* =========================
   메모 저장
========================= */

saveNoteBtn.addEventListener("click", ()=>{

    if(!selectedCustomer){

        alert("고객을 먼저 선택하세요.");
        return;
    }

    const existingNote = notes.find(
        item => item.customer_id === selectedCustomer.id
    );

    if(existingNote){

        existingNote.memo = noteInput.value;

    }else{

        notes.push({

            customer_id : selectedCustomer.id,
            name : selectedCustomer.name,
            phone : selectedCustomer.phone,
            memo : noteInput.value

        });

    }

    localStorage.setItem(
        "malkum_notes",
        JSON.stringify(notes)
    );

    saveMessage.textContent = "메모 저장 완료";

    setTimeout(()=>{

        saveMessage.textContent = "";

    },2000);

});

/* =========================
   최초 실행
========================= */

renderCustomerList();