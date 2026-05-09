// 파일명 : C:\malkum365-landing\admin.js

const customerList = document.getElementById("customerList");

const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");

const customerStatus = document.getElementById("customerStatus");
const customerSchedule = document.getElementById("customerSchedule");
const customerPurchase = document.getElementById("customerPurchase");
const customerMemo = document.getElementById("customerMemo");

const saveBtn = document.getElementById("saveBtn");
const saveMessage = document.getElementById("saveMessage");

/* =========================
   leads 데이터
========================= */

let leads = JSON.parse(
    localStorage.getItem("malkum_leads")
) || [];

/* =========================
   notes 데이터
========================= */

let notes = JSON.parse(
    localStorage.getItem("malkum_notes")
) || [];

let selectedCustomer = null;

/* =========================
   고객 리스트 출력
========================= */

function renderCustomerList(){

    customerList.innerHTML = "";

    if(leads.length === 0){

        customerList.innerHTML = `
            <div class="customer-item">
                등록된 고객이 없습니다.
            </div>
        `;

        return;
    }

    leads.forEach((customer)=>{

        const div = document.createElement("div");

        div.className = "customer-item";

        div.innerHTML = `

            <div class="customer-name">
                ${customer.name || "-"}
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
                .forEach(item=>{

                    item.classList.remove("active");

                });

            div.classList.add("active");

            selectedCustomer = customer;

            loadCustomer(customer);

        });

        customerList.appendChild(div);

    });

}

/* =========================
   고객 정보 출력
========================= */

function loadCustomer(customer){

    customerName.value = customer.name || "";
    customerPhone.value = customer.phone || "";

    const noteData = notes.find(
        item => item.customer_id === customer.id
    );

    if(noteData){

        customerStatus.value = noteData.status || "";
        customerSchedule.value = noteData.schedule || "";
        customerPurchase.value = noteData.purchase || "";
        customerMemo.value = noteData.memo || "";

    }else{

        customerStatus.value = "";
        customerSchedule.value = "";
        customerPurchase.value = "";
        customerMemo.value = "";

    }

}

/* =========================
   저장
========================= */

saveBtn.addEventListener("click", ()=>{

    if(!selectedCustomer){

        alert("고객을 선택하세요.");
        return;
    }

    const existingNote = notes.find(
        item => item.customer_id === selectedCustomer.id
    );

    if(existingNote){

        existingNote.status = customerStatus.value;
        existingNote.schedule = customerSchedule.value;
        existingNote.purchase = customerPurchase.value;
        existingNote.memo = customerMemo.value;

    }else{

        notes.push({

            customer_id : selectedCustomer.id,

            name : selectedCustomer.name,

            phone : selectedCustomer.phone,

            status : customerStatus.value,

            schedule : customerSchedule.value,

            purchase : customerPurchase.value,

            memo : customerMemo.value

        });

    }

    localStorage.setItem(
        "malkum_notes",
        JSON.stringify(notes)
    );

    saveMessage.textContent =
        "고객 정보 저장 완료";

    setTimeout(()=>{

        saveMessage.textContent = "";

    },2000);

});

/* =========================
   실행
========================= */

renderCustomerList();
