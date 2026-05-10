const supabaseUrl =
'https://YOUR-PROJECT.supabase.co';

const supabaseKey =
'YOUR-ANON-KEY';

const supabaseClient =
supabase.createClient(
    supabaseUrl,
    supabaseKey
);

/* =========================
   무료신청 버튼
========================= */

const freeBtn =
document.querySelectorAll('.menu-btn')[1];

freeBtn.addEventListener(
    'click',
    async ()=>{

        try{

            const name =
            prompt('고객명 입력');

            if(!name) return;

            const phone =
            prompt('연락처 입력');

            if(!phone) return;

            const memo =
            prompt('메모 입력');

            const {

                data,
                error

            } = await supabaseClient

            .from('notes')

            .insert([{

                name:name,

                phone:phone,

                memo:memo,

                status:'무료신청',

                created_text:
                new Date()

                .toLocaleString()

            }]);

            if(error){

                console.error(error);

                alert(
                    '저장 실패'
                );

                return;
            }

            alert(
                '무료신청 저장 완료'
            );

            loadNotes();

        }catch(err){

            console.error(err);

            alert(
                '오류 발생'
            );
        }
    }
);

/* =========================
   데이터 불러오기
========================= */

async function loadNotes(){

    const {

        data,
        error

    } = await supabaseClient

    .from('notes')

    .select('*')

    .order(
        'id',
        {
            ascending:false
        }
    );

    if(error){

        console.error(error);

        return;
    }

    const body =
    document.getElementById(
        'crmBody'
    );

    body.innerHTML = '';

    data.forEach(item=>{

        const tr =
        document.createElement('tr');

        tr.innerHTML = `

            <td>${item.name || ''}</td>

            <td>${item.phone || ''}</td>

            <td>${item.created_text || ''}</td>

            <td>${item.status || ''}</td>

            <td>${item.memo || ''}</td>

        `;

        body.appendChild(tr);
    });
}

/* =========================
   시작
========================= */

loadNotes();
