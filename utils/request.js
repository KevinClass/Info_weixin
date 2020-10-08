const apiHttp = "http://192.168.18.12";
const socketHttp = "wss://*****.com/wss";

function fun(url, method, data, header) {
	console.log('url:' + url + ', method:' + method)
	data = data || {};
	header = header || {Authorization: wx.getStorageSync('token'), system: 'authority'};
	let token = wx.getStorageSync("token");
	if (token) {}
	wx.showNavigationBarLoading();
	console.log('header:' + JSON.stringify(header),token)
	let promise = new Promise(function (resolve, reject) {
		wx.request({
			url: apiHttp + url,
			data: data,
			header: header,
			method: method,
			success: function (res) {resolve(res)},
			fail: reject,
			fail: function (res) {reject(res)},
			complete: function () {
				wx.hideNavigationBarLoading();
			}
		});
	});
	return promise;
}

function funBit(url, method, data, header) {
	console.log('url:' + url + ', method:' + method)
	data = data || {};
	header = header || {Authorization: wx.getStorageSync('token'), system: 'authority'};
	let token = wx.getStorageSync("token");
	if (token) {}
	wx.showNavigationBarLoading();
	console.log('header:' + JSON.stringify(header))
	let promise = new Promise(function (resolve, reject) {
		wx.request({
			url: apiHttp + url,
			data: data,
			header: header,
			method: method,
			responseType: 'arraybuffer',
			success: function (res) {resolve(res)},
			fail: reject,
			fail: function (res) {reject(res)},
			complete: function () {
				wx.hideNavigationBarLoading();
			}
		});
	});
	return promise;
}

function upload(url, name, filePath) {
	let header = {};
	let token = wx.getStorageSync("token");
	if (token) {
		if (!header || !header["Authorization"]) {
			header["Authorization"] = token; //添加到请求头中
			header["system"] = 'authority'; //添加到请求头中
		}
	}
	console.log('header:' + JSON.stringify(header))
	wx.showNavigationBarLoading();
	let promise = new Promise(function (resolve, reject) {
		wx.uploadFile({
			url: apiHttp + url,
			filePath: filePath,
			name: name,
			header: header,
			success: function (res) {
				resolve(res);
			},
			fail: function (res) {
				reject(res);
			},
			complete: function () {
				wx.hideNavigationBarLoading();
			}
		});
	});
	return promise;
}


export default {
	apiHttp: apiHttp,
	socketHttp: socketHttp,
	"get": function (url, data, header) {
		return fun(url, "GET", data, header);
	},
	"post": function (url, data, header) {
		return fun(url, "POST", data, header);
	},
	upload: function(url, name, filePath) {
		return upload(url, name, filePath);
	},
	getBit: function(url, data, header) {
		return funBit(url, "GET", data, header)
	},
	getDict: function(code) {
		return fun('/admin/dictinfo/code/' + code, 'GET')
	}
}