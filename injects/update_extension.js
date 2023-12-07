const currentVersion = chrome.runtime.getManifest().version;

fetch("https://6514b3f1dc3282a6a3cd7125.mockapi.io/server?name=Premium%20Easy%20Quiz")
    .then((res) => res.json())
    .then((res) => {
        if (res.length == 1) {
            const lastestVersion = res[0].version;

            if (currentVersion != lastestVersion) {
                const body = document.querySelector("body");
                body.innerHTML = `

                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">

                <div class="card position-absolute top-50 start-50 translate-middle" style="max-width: 500px;">
                
                    <div class="alert alert-warning " role="alert">
                        <h2>Premium Easy Quiz Đã Có Phiên Bản Mới!</h2>
                    </div>

                    <div class="card-body">
                        <b class="text-danger">Vui lòng gỡ cài đặt phiên bản hiện tại và cài đặt phiên bản mới để tiếp tục!</b>
                        <br />
                        <br />
                        <a href="https://github.com/mwarevn/Premium-Easy-Quiz#readme" target="_blank" class="btn btn-primary">Bấm vào đây để tải phiên bản mới nhất!</a>
                        <hr />
                        <a href="https://www.youtube.com/watch?v=cG83bASi384" target="_blank" class="btn btn-outline-warning text-danger">Xem hướng dẫn cài đặt</a>
                    </div>

                </div>
                    `;
            }
        }
    });
