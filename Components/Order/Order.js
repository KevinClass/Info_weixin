// Components/Order/Order.js
import Request from "../../utils/request" //导入模块
import event from "../../utils/event"
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
    loading:false
  },
  ready: function() {
    event.regedit('user', this.notice, this)
   },
   detached() {
    event.unRegedit('user', this.notice)
   },

  /**
   * 组件的方法列表
   */
  methods: {
    notice (res, that) {
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
        url: '../../pages/OrderDetail/OrderDetail?id=' + e.currentTarget.dataset.index.id + '&teamid=' + this.data.teamid
      })
    },
    onSerach() {
      if(!this.data.orderEnd && !this.data.loading)
      {
        this.data.loading = true
        Request.get('/admin/order/search?page.pn=' + this.data.pagePn + '&page.size=' + this.data.pageSize + '&search.orderNo_prefixLike='+this.data.orderNo+'&search.teamId='+this.data.teamid+'&sort.crtTime=desc')
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
