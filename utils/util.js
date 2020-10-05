import Request from "request"; //导入模块
import event from "event"
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getUserTeamInfo = () => {
  Request.get('/admin/user/front/weixinInfo?token=' + wx.getStorageSync('token'))
  .then(res => {
    console.log('result:' + JSON.stringify(res))
    if (res.statusCode == 200) 
    {
      wx.setStorage({
        data: res.data,
        key: 'user',
      })
      event.notice('user', res.data)
    }
  }).catch(err => {
    console.log('error:' + JSON.stringify(err.data), err)
  })
}

module.exports = {
  formatTime: formatTime,
  getUserTeamInfo: getUserTeamInfo
}
