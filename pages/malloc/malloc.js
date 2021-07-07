// pages/malloc/malloc.js

import Request from "../../utils/request" //导入模块
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
    detailType: undefined,
    teamList: [],
    teamTotal: 0,
    triggered: false,
    pageSize: 25,
    pagePn: 1,
    teamName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({orderId: options.orderId, teamId: options.teamId}, function() {
      that.onRefresh()
    })
    let that = this
    console.log('malloc orderId:' + this.data.orderId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      teamName: e.detail.value
    })
  },
  onRefresh() {
    if(!this.data.loading) {    
      console.log('onRefresh', this.data.triggered)
      this.setData({
        teamEnd: false,
        teamList: [],
        triggered: false,
        pagePn: 1
      })
      this.onSerach()
    }
  },
  onTolower() {
    console.log('onTolower')
    this.onSerach()
  },
  onSerach() {
    if(!this.data.teamEnd && !this.data.loading)
    {
      this.data.loading = true
      Request.get('/admin/decorationTeam/search?page.pn=' + this.data.pagePn + '&page.size=' + this.data.pageSize + '&search.teamName_prefixLike='+this.data.teamName+'&sort.crtTime=desc')
      .then(res => {
        console.log('result:' + JSON.stringify(res.data))
        if (res.data.status == 200) {
          this.setData({
            teamTotal: res.data.data.total,
            teamList: this.data.teamList.concat(res.data.data.rows),
            pagePn: this.data.pagePn + 1
          })
          console.log('teamList:' + this.data.pagePn, this.data.orderList)
          if(res.data.data.total <= this.data.teamList.length) {
            this.data.teamEnd = true
          }
        }
        this.data.loading = false
      }).catch(err => {
        console.log('error',err)
        this.data.loading = false
      })
    }
  },
  onTeamKey(e) {
    let that = this
    console.log('onTeamKey', e)
    console.log('id:' +  e.currentTarget.dataset.index.id)
    wx.showModal({
      title: '提示',
      content: '确认分配装修队：' + e.currentTarget.dataset.index.teamName,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          Request.get('/admin/order/' + that.data.orderId)
          .then(res => {
            console.log('result:' + JSON.stringify(res.data))
            if (res.data.status == 200) {
              var data = res.data.data
              data.teamId = e.currentTarget.dataset.index.id
              console.log('data', data)
              Request.put('/admin/order/' + that.data.orderId, JSON.stringify(data))
              .then(res => {
                console.log('result:' + JSON.stringify(res.data))
                wx.navigateBack()
              })
            }
          }).catch(err => {
            console.log('error',err)
            this.data.loading = false
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  }
})