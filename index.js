const { Wechaty }       = require('wechaty')
const { PuppetPadplus } = require('wechaty-puppet-padplus')
const qrcode            = require('qrcode-terminal')
const config = {
    name: 'forwradBot',
    token: 'tokenCode',
    sstg: 1234,// 转发间隔时间 建议大于或等于1s
    group: [   // 监听的群
    	'新青龙帮',
    	'小学扛把子接单群',
        '萝莉夜总会',
        '奥特云国际交流组织',
        '少奋斗二十年富loli群',
    ],
    toGroup: [ // 转发的群
        '相亲相爱一家人',
    ],
    // 转发关键词
    keyword: ['联系', '手机', '微信', '找我', '努力', 'giao']
}
const bot = new Wechaty({
    name: config.name,
    puppet: new PuppetPadplus({
        token: config.token
    })
})

/*
* 主要功能：判断n个群里面是否存在 x关键词 是则转发至自己的n个群内
* 
* 改监听群及转发群的监听名字改为监听微信群ID的逻辑
* 首先用findall获取全部群id，填入需要监听及转发的群ID
* 把下面这行判断逻辑改为判断群id
* if(config.group.indexOf(room.payload.topic) < 0) return
* 转发的话先获取全部群ID与转发群ID判断获取到Room对象发送即可
*
* 默认转发除文本消息外的类型 不需要转发给toRoom方法注释即可
* if(v.type() != 7) return // toRoom()
*/

bot
.on('scan',         (v, c) => {
    if(c == 2) console.log(qrcode.generate(v,{small:true}), `微信扫码`)
})
.on('login',             v => console.log(`${v.payload.name} 登录成功`))
.on('logout',            v => console.log(`${v.payload.name} 退出登录`))
.on('room-invite', async v => console.log(await v.accept(), `已进群聊`))
.on('message',           v => {
    let
    from = v.from(),
    room = v.room()
	
    if(!room) return
    if(v.type() == 0) return
    if(v.type() != 7) return toRoom()
	// 文本消息逻辑处理
	// 是否为监听群
    if(config.group.indexOf(room.payload.topic) < 0) return
	
	// 是否存在关键字
	for (let k in config.keyWord)
	if(v.text().indexOf(config.keyWord[k]) >= 0)
	return toRoom()
	
	// 循环发送转发群
	function toRoom()
	{
		for (let k in config.toGroup)
		((k)=>{
			setTimeout(async i => {
				let Room = await bot.Room.find({topic: config.toGroup[k]})
				if(Room) v.forward(Room)
			},(Number(k)+1)*config.sstg)
		})(k)
	}
}).start()
