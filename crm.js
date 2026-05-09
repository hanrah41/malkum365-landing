// 파일명 : C:\malkum365-landing\crm.js


/* =========================
   Supabase 연결
========================= */

const supabaseUrl =
"https://pziyabogqefxzvinwarg.supabase.co";

const supabaseKey =
"sb_publishable_VrVP0buVQ3kCBiQm88Jr5g_q61_DoK8";


const supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


/* =========================
   선택 고객
========================= */

let selectedId = null;


/* =========================
   고객목록
========================= */

const customerList =
document.getElementById(
    "customerList"
);


/* =========================
   고객 목록 불러오기
========================= */

async function loadCustomers(){


    const {

        data,
        error

    } =

    await supabaseClient

    .from("notes")

    .select("*")

    .order(
        "id",
        { ascending:false }
    );


    if(error){

        console.log(error);

        return;
    }


    customerList.innerHTML = "";


    data.forEach((customer)=>{


        const item =
        document.createElement("div");


        item.className =
        "customer-item";


        item.innerHTML = `

            <div class="customer-name">
                ${customer.name}
            </div>

            <div class="customer-phone">
                ${customer.phone}
            </div>

        `;


        item.addEventListener(

            "click",

            ()=>{

                selectedId =
                customer.id;


                document
                .getElementById("viewName")
                .innerText =
                customer.name;


                document
                .getElementById("viewPhone")
                .innerText =
                customer.phone;


                document
                .getElementById("consultation")
                .value =
                customer.consultation || "";


                document
                .getElementById("schedule")
                .value =
                customer.schedule || "";


                document
                .getElementById("purchase")
                .value =
                customer.purchase || "";


                document
                .getElementById("etc")
                .value =
                customer.etc || "";

            }

        );


        customerList.appendChild(
            item
        );

    });

}


/* =========================
   최초 로딩
========================= */

loadCustomers();


/* =========================
   실시간 자동 반영
========================= */

supabaseClient

.channel("crm-realtime")

.on(

    "postgres_changes",

    {

        event : "*",

        schema : "public",

        table : "notes"

    },

    ()=>{

        loadCustomers();

    }

)

.subscribe();


/* =========================
   저장 버튼
========================= */

document

.getElementById("saveBtn")

.addEventListener(

    "click",

    async ()=>{


        if(!selectedId){

            alert(
                "고객 선택 필요"
            );

            return;
        }


        const consultation =

        document
        .getElementById("consultation")
        .value;


        const schedule =

        document
        .getElementById("schedule")
        .value;


        const purchase =

        document
        .getElementById("purchase")
        .value;


        const etc =

        document
        .getElementById("etc")
        .value;


        const { error } =

        await supabaseClient

        .from("notes")

        .update({

            consultation :
            consultation,

            schedule :
            schedule,

            purchase :
            purchase,

            etc :
            etc

        })

        .eq(
            "id",
            selectedId
        );


        if(error){

            alert(
                "저장 실패"
            );

            return;
        }


        alert(
            "저장 완료"
        );

    }

);