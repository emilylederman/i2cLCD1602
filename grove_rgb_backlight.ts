/**
* makecode I2C LCD1602 package for microbit.
* From microbit/micropython Chinese community.
* http://www.micropython.org.cn
*/
const enum Backlight {
    on = 8,
    off = 0,
}
const lcd_address = 0x7c>>1;
const rgb_address = 0xc4>>1;
/**
 * Custom blocks
 */
//% weight=20 color=#0fbc11 icon="▀"
namespace grove_rgb_backlight {
    let i2c_address: number // 0x3F: PCF8574A, 0x27: PCF8574
    let backlight_control: number      // backlight control
    let RS: number      // command/data

    // set LCD reg
    function setreg(d: number) {
        pins.i2cWriteNumber(i2c_address, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // send data to I2C bus
    function send_data_to_I2c_bus(d: number): void {
        d = d & 0xF0
        d = d + backlight_control + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // send command
    function send_command(d: number) {
        RS = 0
        send_data_to_I2c_bus(d)
        send_data_to_I2c_bus(d << 4)
    }

    // send data
    function send_data(d: number) {
        RS = 1
        send_data_to_I2c_bus(d)
        send_data_to_I2c_bus(d << 4)
    }

    // auto get LCD address
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0

    }

    /**
     * initial LCD, set I2C address. Address is 39/63 for PCF8574/PCF8574A
     * @param address is i2c address for LCD, eg: 0, 39, 63. 0 is auto find address
     */
    //% blockId="I2C_LCD1620_SET_ADDRESS" block="Initialize LCD with address %addr"
    //% weight=100 blockGap=8
    //% address.defl=39
    //% parts=LCD1602_I2C trackArgs=0
    export function LcdInit(address: number) {
        if (address == 0) {i2c_address = AutoAddr()}
        else {i2c_address = address}
        backlight_control = Backlight.on
        RS = 0
        send_command(0x33)       // set 4bit mode
        basic.pause(5)
        send_data_to_I2c_bus(0x30)
        basic.pause(5)
        send_data_to_I2c_bus(0x20)
        basic.pause(5)
        send_command(0x28)       // set mode
        send_command(0x0C)
        send_command(0x06)
        send_command(0x01)       // clear
    }

    /**
     * show a number in LCD at given position
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_NUMBER" block="show number %n|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * show a string in LCD at given position
     * @param s is string will be show, eg: "Hello"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_STRING" block="show string %s|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        send_command(a)

        for (let i = 0; i < s.length; i++) {
            send_data(s.charCodeAt(i))
        }
    }

    /**
     * turn on LCD
     */
    //% blockId="I2C_LCD1620_ON" block="turn on LCD"
    //% weight=81 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function on(): void {
        send_command(0x04)
    }

    /**
     * turn off LCD
     */
    //% blockId="I2C_LCD1620_OFF" block="turn off LCD"
    //% weight=80 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function off(): void {
        send_command(0x00)
    }

    /**
     * clear all display content
     */
    //% blockId="I2C_LCD1620_CLEAR" block="clear LCD"
    //% weight=85 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function clear(): void {
        send_command(0x01)
    }

    /**
     * turn on LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_ON" block="turn on backlight"
    //% weight=71 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOn(): void {
        backlight_control = Backlight.on
        send_command(0)
    }

    /**
     * turn off LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_OFF" block="turn off backlight"
    //% weight=70 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    export function BacklightOff(): void {
        backlight_control = Backlight.off
        send_command(0)
    } 
}