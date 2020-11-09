// Components/Order/Order.js
import Request from "../../utils/request" //导入模块
import event from "../../utils/event"
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hidden: {
      type: Boolean,
      value: false,
    },
    teamid: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    triggered: false,
    pageSize: 25,
    pagePn: 1,
    orderNo: '',
    orderTotal: 0,
    orderList: [],
    orderEnd: false,
    loading:false,
    teamIds: ''
  },
  ready: function() {
    event.regedit('order', this.notice, this)
   },
   detached() {
    event.unRegedit('order', this.notice)
   },

  /**
   * 组件的方法列表
   */
  methods: {
    notice (res, that) {
      console.log('global', app.globalData.sysUser)
      if(app.globalData.sysUser.teamId == 1) {
        Request.get('/admin/userTeam/teams')
        .then(res => {
          console.log('teams', res.data.data.rows)
          let teams = res.data.data.rows
          teams.forEach((item, index) => {
            if(index != 0) {
              that.data.teamIds += ','
            }
            that.data.teamIds += item.id
          })
          console.log(that.data.teamIds)
        })
      }else {
        that.data.teamIds = that.data.teamid
        console.log('teamIds, init', that.data.teamIds)
      }
      that.onRefresh()
    },
    onRefresh() {
      if(!this.data.loading) {    
        console.log('onRefresh', this.data.triggered)
        this.setData({
          orderEnd: false,
          orderList: [],
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
    onInputChange(e) {
      const {
        field
      } = e.currentTarget.dataset
      this.setData({
        orderNo: e.detail.value
      })
    },
    onOrderKey(e) {
      console.log('onOrderKey', e)
      console.log('id:' +  e.currentTarget.dataset.index.id)
      wx.navigateTo({
        url: '../../pages/OrderDetail/OrderDetail?id=' + e.currentTarget.dataset.index.id + '&teamid=' + this.data.teamid + '&status=' + e.currentTarget.dataset.index.status
      })
    },
    onSerach() {
      if(!this.data.orderEnd && !this.data.loading)
      {
        console.log('teamIds, init', this.data.teamIds)
        this.data.loading = true
        Request.get('/admin/order/search?page.pn=' + this.data.pagePn + '&page.size=' + this.data.pageSize + '&search.orderNo_prefixLike='+this.data.orderNo+'&search.teamId_in='+this.data.teamIds+'&sort.crtTime=desc')
        .then(res => {
          console.log('result:' + JSON.stringify(res.data))
          if (res.data.status == 200) {
            this.setData({
              orderTotal: res.data.data.total,
              orderList: this.data.orderList.concat(res.data.data.rows),
              pagePn: this.data.pagePn + 1
            })
            console.log('orderList:' + this.data.pagePn, this.data.orderList)
            if(res.data.data.total <= this.data.orderList.length) {
              this.data.orderEnd = true
            }
          }
          this.data.loading = false
        }).catch(err => {
          console.log('error',err)
          this.data.loading = false
        })
      }
    }
  }
})
