// 파일명 : C:\malkum365-landing\admin.js


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
   고객 리스트 영역
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
   실시간 자동 갱신
========================= */

supabaseClient

.channel("notes-realtime")

.on(

    "postgres_changes",

    {

        event : "*",

        schema : "public",

        table : "notes"

    },

    ()=>{

        console.log(
            "실시간 데이터 변경 감지"
        );

        loadCustomers();

    }

)

.subscribe();
