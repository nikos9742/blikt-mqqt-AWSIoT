import React from 'react'
import ReactDOM from 'react-dom'
import * as Rx from 'rxjs/Rx'

import Page from '../components/Page'

// pixel: 0-7
// rgb: 0-255

// global lum: 0.0-1.0

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        // Canvas
        const canvas = ReactDOM.findDOMNode(this.refs.canvas)
        const img = canvas.previousSibling
        canvas.width = img.width
        canvas.height = img.height
        const context = canvas.getContext('2d')
        context.drawImage(img, 0, 0, img.width, img.height)

        // Events
        this.mouse$ =
            new Rx.Subject()
        const pixel$ =
            new Rx.Subject()
        this.rainbow$ =
            new Rx.Subject()
        this.mouse$
            .map(([x, y]) => {
                const rect = canvas.getBoundingClientRect()
                return [
                    x - rect.left | 0,
                    y - rect.top | 0
                ]
            })
            .subscribe(pixel$)
        const color$ =
            pixel$
            .map(([x, y]) => context.getImageData(x, y, 1, 1).data)
        const out$ = color$
            .map(color => ({
                brightness: 1,
                color: {
                    r: color[0],
                    g: color[1],
                    b: color[2]
                }
            }))
        out$.map(obj => JSON.stringify(obj, null, 2))
            .forEach(json => this.setState({ json }))
        out$.forEach(out => document.body.parentElement.style.backgroundColor =
            `rgb(${out.color.r}, ${out.color.g}, ${out.color.b})`)
        out$.throttleTime(400)
            .forEach(json => fetch(new Request(
                'https://601145d4.ngrok.io/led',
                {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    mode: 'cors',
                    body: JSON.stringify(json)
                }
            )))
        this.rainbow$.throttleTime(400)
            .forEach(() => fetch(new Request(
                'https://601145d4.ngrok.io/rainbow',
                {
                    method: 'POST',
                    mode: 'cors'
                }
            )))
    }

    render() {
        return (
            <Page>
                <h1><big>Blink</big> me, I'm famous!</h1>
                <div className="pure-g">
                    <div className="pure-u-1-1">
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAGBZJREFUeNrsnYuO6zpyRbcwJxMg//+zCZBUkhncgzu3JXLverAkUYZhqN22xVV8SKznYQD+3vn877/hv9D53Jy/FR5/w/8A/9nI/+v/J0DwYaGn2cnbax/W/ex8dMM34/9jAjR238UvbDH0/gl6ugDswf/HBOiE774CIDoAcIdBnH4FfNIIjl8BGldfdQLwbSgYAMEWlfV4hB9P4S/oeXUClPATEyDYhvAECPZBatdvxz/9mXGLpmQmjPsS/uEEuPoFiXgmicEAUEUsQfg3KHvwL4EfT4AV/NcTwOhfY6brtSQGWiBmKSCXK/MMgE35bR381QRYx38xAYygZxp2ds2bDgBGgmPoq64KjP5d+MmhnwQPu7ozWsV/NgHGvzZtAwE9GABTwZGtuOo2fQxsx78QHtzs5/mh8v+YAEb/OW7SoP3KJlA6j0rAjf6N+JfDw5h9ssBvKv9sE3w6nWz2LxPE8OcBgCG9ia0ILHzP5Ecm/xJ42GSxL+f/1wlg+vHP9jBiIFbA6S8xYpgeDzv9afwW4u+Ah7FrP8Ps4efsAD+PB/SMSAgtiHE/fNqc8Nr/8a+Bh2mj39L5Z1ogG75J9tAQ8PcAGH+QlDvTaqXfd+S32YifctLwsMkcKeenXSGMOzDugFMDghDD9CDPFeDN/LZQCrQadAX/nyYA/7OmH8RcAdQDl3h250+HT/IFquUnLME/BSAJZiaeKz04ODFIbcxY8rfgT4GHZxNcxM/vAWwoiQE3BN2vTw8+PadTBu/mvxN8zA4Q4VddIRjBnJ7xtHkxLcj451XovIHxEP4MY3AZPEyYOCX8Qy3Q4Aft+s1By88YzSYfGfzkuCHwr4lb8y+EB3H5G4/+KD9tB+AFgNmVn7aETvudbE6G/mdT/mL4U0uwTwpO/kBIpHlfOTWg43Xt4z381gY/tQSX8/8xASzvtT4mNrG94Q4NkN+JvwneFxOcyS8awhgBiBIyfRGQ7gtWrffeEfIE/jJ4dQ+Qz094gxohDAYagh4c4T0REgbDbfjRwL8EHubf+OfwcxFhzIab1Ie59OCkAsypCk5W/RXw21L+hfA+O0AmvzcgZkpMW0TMtG+QU4IEom1BpGno2fzL4WHkp8r4aVcIxgjOOwQoMbGgZZBnD34Lv1fRswoetBWwil9Rg8b9pFybwIjTU8E++FH8dnN4cPd/hfwub1DQLWTcYQMesW4f2Zg36Av5m+CnATFF2EZfAYLBEZhvbMwVE2FK07IXvhvwYwV/PTxsfpfEd7uHn9ACTeNspBihWEwsxEg4b3jg7fmtkH8hvCMmOJlfDIqXQpO5AGkz6rPqyRkarut34e+Ah7EfT+RXDWGnx4Oz89Mfcl4cC6cEQPQ68ED++8KreYFS+M1rByAzwkAMiKDVgGQyJClPlKIKfyx/zARWCS+pQUv4xbQooFPjgRYAJ4PpqZCTC/Dt/HYreCYtCg/s4Sdyg0JMjooz3NgmUM2KieT8sPfmRyb/WnhyE0ymyPXw09mhMUuPjWt6+COiQCTJZpoZ0ALdnt+S+XmphuExS4pUzj90hZgWSMA1OlcdAXSFlEiZBFeNiI9/ATyIcLhafsIQZrPqG7xU9MxokriltivTYFP+enjGEFbLrwTESCel17O/WEL53/A1MDwY7sqPQv4yeKY+QC1/LCbY9NZyasD4eeof5mpaGb89ER7mGDGp/L+sW1R8lcTHPm7Nb9393zutMyrFx543qJS+Kz9uwd/b+dlXgFVZER652N+N33rJI1kh0vj1CaC2reAWqHVubM0f10xk3AJl8tO5QdUt+NRGQlhCyR+uV4REOvrx/JXwMP9Xc/g5O4B6LsWgcaUFUVUKavNj5jDoiouH8dsKeJj02QJ+0RIsNYbMDcnZQvhJV2kJ3oU/YgZW4Hk7QBV/oFI8OAeNjJBAKO5AFvKE+/g1fzgV3jwhkYX8tDco2e+6JGx2GxhxCHWNga35HW6mEjyETfAKfiIgZuqA7fAHhycxFGhJjHsrMABezm+6LGLBAFJirBJ+OiQSZRFBNUFBGfruXH57Fn8dPDwBMVX8dFA8GY5s8hiwmrBQV4hsKT9uzt8BD6VKZIQ/YgeIZwsIxMTyHTBtr3dB9PHbO/iL4acxwVn8l0IRI8IGpyazuYgRUXw6GJslQ8qICOP58Vx+KRdQDH4aEVbO78oMdwWtsgz14OTPgE6QF9sGbMpfDA8TCEv4A7lBTw/EzKgIVEpPaTU91m/DjxL+JnjJGa6EX9kDMLi6PKTksNL5K5c/cDm7C/htKX8xvJocN5+fqA9wJYCBPJRE8UaogkGviUn58SP8005/AP8q+LEleAU/lxnOiD8lMcRuAX7+edo610io4MdT+JfDS2rQEn5dC3QlgDE3ZDXg+AdAyCCwCKbz24P4F8IP1KCL+OkqkTb7lzLo+RVw+sN8A703wCn8SODHUv4l8GRy3EJ+MSLMlNfskEDp/DWPVn5r5i+AR1mVcPZRUClefP2dH7/l1dW5b+NvOfmP+gA9/N8VoILfXsmfCw+/HaDiCvDtATL58QL+JfDT7NDl/G/WAjFMqxQhT+JnhlISPIxVF1Xxv9kO4FIGbs1vXll44aFc/kr4P0vwx98IDzojwHgOJFqCB8L4fIEovFfxF8PDWyg7jf/zBs3lL9CCLeFvgne4QiTzvz8eoGYFJPnxaP56eCYeYMofuva9PyLMNSS25l8Iz0eEQXyT5d8xJjiwG96Ovxiejwm2Iv4ds0KYp7vfz98Bz6RFqeX/8gJ9/I3wpCtEIf/LM8NlGMI24l8OX50ZzmcIe1FuTNdS+EB+pPGvhc/KDernf2F2aGyYHdoy+RnOJPis7NB+/hfWB8jIBrc7v81KBCTBJ9YHgI9/iwoxAWXgjflRzl8Pj0CFGGYIzPnfViOMbKxrJNyM3xbxq+cUIQJfzeB/W5XIynCwj18ej0m+QIX8X53gj78RHq11gn9PAOt8bl8pvZnfuvl7O/+XdS8LjluAxKb1L4uv5g9PgOqmRSaA73pFa0GC57nNBf+F/JYGP9ACBU+VvgewmDrgWsf1F0MQvKzFQyKR3x7HbzFFGG0HaODn7AC+k3KSMKOcByODMaPrE/kvFoD78dfDY2YGL+cXLcHQW5V0D8yLJOlet5QfN+dfBc+rQUl+ea8jRoSp7jCEU8g4IgqEgYRvZmx7uAs/CW8J8NOIMJXfVH7aGzTiE+jKjjyVJiMJ11K4NT8PjwT4aWa4cn4xJBJ5XuFiQAhoSWQr+rbmL4YHXSi7ip/LDDegn7bNWyAiEg4UiI7amn85PGrC4QR+OiSSjxIVI0OZ5LBqQChyQsO35l8CD5t8qpyfDopn6P9yzIU4/86PH0kJkJQqYGv+DniYMOKzmJmg+GliFYYeaZtAeDNjeNfBrfkd8OaEJzfBEr9J/K7McFlZ4uiQQD4tWHaKtK351TPo8GRIZCF/IDeoeQ8CyWF92QFrcoO+ir8J3p0cN8gvqUF5Ien006wIwfyoqY+t+WvgwWkA0vkZd+hp4nVHVuyYGhB0lnjM0sXrPb4X/yp4SQ0q8bNTQrEDXAlmLIa8xFA2O61EoKvC38+/HF5KjDUGJqc+aQc4/daVAEipBPTgJP2VDGJaoO34U+AVO4Cb3+L8dJVIXAtg0LYByzAvzvQHBqedEojTYFP+IDxAYhla+ZWAGOisSNgEOk5VsA/cmr8MHvTlT5p3An9BpfglWRHir2IXv5m/Dz4SFJ/T87GY4AwhjevkBsa0dqe7hN9ew583N6pGNnlzR7tDkzswBlq0hPJXu5obgUR+PI6/GB7G7pmr+IdaoOkOKLD3+f3mtEYWc5eZvRVcwG+35V8ID6JGWC0/nRuUV4yJKjG+QkqO3itkBk3kx1P4K+H5gJgqftoQZrolMNsfXjIGsoYQfPyN8FAKpJXw064QklmcsWfP8uPzBnG+jQFvgL34V8GDrhNcxe/yBs1wApTSgqgH8AyDrfmb4BGoFO/gjxvCpge6SMycxIGxnnhBuCt/qg60DB4BX/BIt0+9Qck4o3GYDhcWYXSxcCPOzLTa1eNP4w/cBS2EhysayMfvvgI4IgEhBMYZXSycORtywuE//jXwEONBI/yMGtT0Y0c4dCAmdozuICC6exf+Dng1JjifX0mLwiRiYQRAW0JB58TgpRJY/vbiXwI/tgSv4PcGxEDJ25WXF2f6p0SgqMK34F8Oj6SsYH5+IjfoNBOjlBGP1oNLafKQmSnwvfy3g5fUoCX8gUrx49TAoAVA1Eq++nnkZ8Z9L793AaiEZ2KCa/kJSzAzstx5sq+1ICASY/NpsMNL4fP57YbwMKEmQAn/bBM8LZMQqZRARERBKQ2R0fUf/0r4aURYOT9nB7BZAQ7jpqvXFYA5j9RkfSQ8ih9p/MXwUApll/CLEWG+MZgUEhhsEZInwz34F4qgAF4KiSzhz6gTbKFnsFD0DR6t/PZoeFjCb4Qe/RPgBqPYup87wzfj/2MCtHZffAV89gVkY/5YVogc/hvcAmHzW6Bn8wfb3s5/g00wNt8EP4a/YhOMbv4bqEGxuRr01vzValB089/AENZrCMGL+JHJv8YQhm7+G7hCrDKF6wPgafyWxr/MFQLd/DdwhlvlDHVXZ7jb8a90hkM3/w3cocVvkK3AY9yh78VfCk9MgNX8NwiIoZ3BmdNKBNwA2Ii/Gh7yJric/wYhkb0hcfj4G+Fn/1wdEtkSFN4bFI2PvxEe6Oa/QVqUVWkxkHMd2Iu/Oi0KuvlvkBirJjHSGIXu9x35VybGQjf/DVIj1qTGy3YI2Jq/LjUiuvlvkBx3YXLUoXi25u9Kjotu/hukR+9Nj42PvxEe6Oa/QYGM3gIJ2Iz/XvCSHaCE/wYlkmju058/bVH2bfCL+O1W8EA3/w2K5M0+MvjJcUPGNESnb8q/EJ5RF9Xy36BMKmsxmbyO/xVe/jflL4bn75iq+G9QKFtnrRnoH/96eKCb/48JYHmv9TGxie0Nd+gb+PvgvV/K4xcNYQy6KBsHqHRdXLXkvZm/DB7o5ie8QY0QBne14/Xg5KVxyh0bDFvzL4FHYOObw89FhDEbblIf5tKDkwqwPK3o1vwL4X12gEx+b0DMlBisp7eJ3yCHBAlE24K24F8OD3Tz064QjBGct4krMbHQzYAxe+jHvwwe6OZX1KBxPynXJjDi9FSwD96UvwYe6OZ3eYOCbiEhiSwPQHNxKF38Zv4meKCbf3YFGNBLIglYQiXi7NVwa/56eO4uSRjoMj+hBZrG2TDhQMiJiYUYCecND9yafyE84OS3LH4xKN6UYy6+Wfms3BBoI2Fr/sXwf5oAnfxKWhRwZ+env54Xxzj0wNr/8S+ChycvUD6/YgcgM8Lwul1RDTg+GwhJxOwA7+dfDi+pQUv4xbQooFPjgRMAHRAyPRX8uRA//i54oJufyA0KMTkqzu/1IptANSskQvlht+ZfC09ugsf8iPDT2aExS4+Na3r4I6JAJMlmmhnQAm3HvxB+qjJl+C3CP3SFmBZIwDU6Ux2BTguCWJkEc7pC7Mu/Cp77SCU/YQgbfJ1vlTczmiRuqe3KSNiUvx6eV5dV8SsBMdJJ6fnsWjb8DQwPhh35y+CBNH74+GMxwaa3llMDxs9T/9iaPwkeSON3iuCXdYvqfiP74183T9pndkal+Niz9eTqGvNC/s3Pn30FWJUV4bFL3pv5F2aFyL0CJFIeK24BWofH1vzZ8L5boEx4OjfogHLcqmPygSlKRBdQ0O/b8VfCM3gRXVh8Agy4B9N/IAxaC6JqgyWDjtj7m/LXw6s2tHz+mSX44FYDEvef/+Ly40tmcRCKtIze34V/FTyQz59iCb6ivxLJcS2kmRiYkDhkuMOIvkD78i+EB/L5TeK/8AY9hu8M0A9OEmCzIiDmEOkaA1vzr4VndrS1/GcBMcf13CfRTyVx8SefGAm6S7juIb41/3J4oJt/FhJ5XPzJoB+Ti58UEKIGBXlvfj7+lfBAN/+PoPiDIz6GkphyzwZAPCzUFSK6NX8HPGkHyOVX7QADwRychC4ufkxMLGhccaz7lsLt+IvhgQZ+JivElVnvFHRKfIp+UBFRfDoYmyVDimmBNuJfCA908xOGsOP64BR0THyc5MWZQvuypGUsglvz18MD3fz/mhv0CB8w8sBoAPDQyDigu/vl/E3w0h6ghF/ZAzC4jDyIAcBAS1IpuAhswV8MD3TzD10hjmtJjHHJ9zGxhIIulgCxTEJADbgF/yp4oJufMIQdhAB+LgV2jvvzT/USePoniD+9hrCN+JfDO26BeH5qJuhaoCsBXIkB129ipAbE8E0oMkjVAr2ffyE8UMhPTX3CEvwXdFwLQOEmV8CpMMa4lmAJ3pR/CTzQzS9GhA3QD42bvwUw4ceyNr4f/xp4oJv/T5Xij55XlSz31dW5b+Pvg28kt/orwCNWAHz8jfD3uQIk3gb+bgMnj9ftAV7CvwT+tnsAtyIAsjzepQV6A/9C+H7+VDsALv4ctvNFdoDH8y+H7+fPswTjYuIP3r+DJRAffyP8DS3BkjsIzqb/+AM/GvlkX6D38xfD9/MXeIOecl8373XeoI/kb4Lv54/FA4Dmvv7vk+MBXs5fD9/P740Iw0wktFSeGRH2Zv6F8P38STHBGB6fcU/VYI+KCX4tfzF8Pz+dFQIc8QD6om0PyQrxfv4O+H7+QF6gU3pcC+AQBgAekBfo5fxL4Pv5CUMYLtDH9BgK4DgZAFOd8FQMKMkMtxH/cvh+fm9uUHDCOH2HvgSCEwMacoO+ln8tfD+/kh0aF2+eCuOK/noFuH126F34F8L38w9dIQbQuFgWxvQzAdysPsC+/Kvg+/kJQxiui4SAE8lQMLevELMvfz18Pz9dI+yUlbnCHnPt2xNqhO3LXwnfz++qEjl4HPKt56OqJO7Onw3fz19QJ1j/hvq88WNrfq+9oZP/j0rxrVJrfPo77i381j9rOvl/Wfey8OT1/uOPXxOa+QMTgPzmMfnWlPiu9wVb8yfB9/PTE8CILQ8jmB/6MFIBRmq8yobE1vxl8P38nB2AJz44eRC+MLwGeCqSjK7fkb8evp9ftASDtgdiaBKEIAAGmlGbuXp/U/5V8P38YkQYRI8QzJ1CJC8QtyMIor5AG/EvhO/np71BEfAJxLkXyFgAmMljLImAP9jW/Gvh+/nFkEjkeYUPBYAMZ/AkJffW/MXw/fxcZrgBfSQu6EIACIcDBaKjtuZfDt/PT4dE8lGiGEaGigKAKyAUOaHhW/Mvge/np4PiyRwAmOUD+HGs0kM5FuWxNX8HPNDNT2iBfmZFmkrFhKVgAGpEGqQxrncd3Jp/IXw/vyszHFyJwq4NITy0IzdSQWa4Xfjr4fv5A7lBx9CkPBTWeHa81Nygr+Jvgu/nV5zh3MlR6UsghqngHflRUx9b89fA9/MT9QFOc8KDK43AqQFBlEBgPgY6Xbze43vxr4Lv51fsAHCVB5nphM0lBszqhBTYAd7Pvxy+n5/zBZoWiGKkMrsEYlYDjS8N7iqO9PGvh+/np6tEnr55RTzY/19rASRhYFYtbSAJcRpsyr8Evp9fCYiZFobFhTC4TSD/2lEtd2v+Mvh+/oJK8bpwG1/pLn4zfx98P38sJjhDSOSdXV91+I+/Dr6fn3aHZvY+5IJwrQUAXQTZxO8W9PUW/MXw/fxDLdB0BwTllvBCEiYuBdKb3q3g1vwL4fv56dygvGIMQ3lcXAKnqqyCovBFWtG38VfC9/PThrBpjXDRAEgKIPH9mCFsC/7l8P38tCsEFLP4QBIX94AORN9X9IVvR/5V8P38Lm/QDCdA6FgVB0Snb8HfBN/PLxrCpge6SMiIhsjHUu+Ed+Qvg+/nn/kCjaODfiJCDoswXRjxN/Ue34h/IXw/v7dS/BgaQmCceY/VL2ZoQbbjL4bv5z/+4+f0lI7DX7Hjsr0OxLBUtuZfDv9/x7kw8leUtCg4WwGgJ8e4vgTyQJFPepe/vfiXwPfzewNiQKcFo/XgV4214s9//H3w/fzHv0+vhcXv2DEhKH2HuBfYjv9Y+s5K2hP+4++8GGretGO+LNS9qQyDjfiPdW8uQz3nP/5NFcPgfddX7GCvjkxXOr7y8ffBX02AdfzHL7ckyA/Mvm7TDwT+iwRN4Nb8xfDjCbCC//hbrjz0Txr/SeR/Mns8vJn/KPlkBVVKXiD+l49QG4KdtTYWamv+Avh+/ow6wfagEbxsYOzCb+0/8D2+x/dwP/5XgAEABJjQmv7BGQQAAAAASUVORK5CYII=" />
                        <canvas
                            ref="canvas"
                            onMouseMove={event => this.mouse$.next([event.clientX, event.clientY])}
                            onMouseDown={event => event.preventDefault()}
                        /><br/><br/>
                        <button className="pure-button" onClick={() => this.rainbow$.next()}> Rainbow!</button><br/><br/>
                        <iframe src="//giphy.com/embed/26AHG5KGFxSkUWw1i" width="48" height="48" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
                        <style jsx>{`
                            img {
                                display: none;
                            }
                        `}</style>
                    </div>
                    <div className="pure-u-1-1">
                        <pre>
                            {this.state.json}
                        </pre>
                        <style jsx>{`
                            pre {
                                padding: 15px;
                            }
                        `}</style>
                    </div>
                    <div className="pure-u-1-1">
                        <img src="http://fr.qr-code-generator.com/phpqrcode/getCode.php?cht=qr&chl=https%3A%2F%2F2172f930.ngrok.io%2F&chs=180x180&choe=UTF-8&chld=L|0" />
                        <style jsx>{`
                            img {
                                padding: 15px 0;
                                width: 256px;
                            }
                        `}</style>
                    </div>
                </div>
            </Page>
        )
    }
}
