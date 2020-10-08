// pages/Detail/Detail.js
import Request from "../../utils/request" //导入模块
import event from "../../utils/event"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: undefined,
    teamId: undefined,
    orderNo: '',
    orderName: '',
    imageUrl: [],
    details: [],
    detailType: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({orderId: options.orderId, teamId: options.teamId})
    let that = this
    Request.get('/admin/order/' + options.orderId)
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        that.setData({orderNo:res.data.data.orderNo, orderName: res.data.data.orderName})
      }
    }).catch(err => {
      console.log('error',err)
      this.data.loading = false
    })
    Request.getDict('DetailType')
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      this.data.detailType = res.data
      
      Request.get('/admin/orderDetail/search?page.pn=1&page.size=1000&sort.type=asc&search.orderId_eq=' + options.orderId)
      .then(res => {
        console.log('result:' + JSON.stringify(res.data))
        if (res.data.status == 200) {
          //that.setData({orderNo:res.data.data.orderNo, orderName: res.data.data.orderName})
          let details = res.data.data.rows
          let p = new Array()
          details.forEach((item) => {
            if(item.path != undefined) {
              p.push(new Promise((resolve, reject) => {
                Request.getBit('/admin/orderDetail/image?name=' + item.path)
                .then(res=> {
                  let url ='data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
                  item.url = url
                  item.type = this.data.detailType[item.type]
                  resolve()
                }).catch(err => {
                  console.log('error',err)
                  reject()
                })
              }))
            }
          })
          
          Promise.all(p).then(() => {
            that.setData({details})
            console.log('end all imageUrl', details)
            console.log('end all imageUrl', this.data.details)
          })
        }
      }).catch(err => {
        console.log('error',err)
        this.data.loading = false
      })
    })
  },
  showBusy: function () {
    wx.showToast({
    title: '加载中...',
    mask: true,
    icon: 'loading'
    })
    },
  viewImage: function(e) {
    let url = e.currentTarget.dataset['index']
    wx.showLoading({
      title: '加载中',
    })
    wx.previewImage({
      current: url,
      urls: [url],
      complete: ()=>{
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  }
})