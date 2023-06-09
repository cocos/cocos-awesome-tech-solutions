const test = require('fresh-tape')
const Buffer = require('buffer').Buffer
const { encode, decode, sizeOf, familyOf, v4, v6 } = require('.')
const crypto = require('crypto')

test('IPv4 addresses tests', t => {
  t.ok(v4.isFormat('0.0.0.0'))
  t.ok(v4.isFormat('1.1.1.1'))
  t.ok(v4.isFormat('1.1.1.1'))
  t.ok(v4.isFormat('11.11.11.11'))
  t.ok(v4.isFormat('111.111.111.111'))
  t.ok(v4.isFormat('255.255.255.255'))
  t.notOk(v4.isFormat(''))
  t.notOk(v4.isFormat('1'))
  t.notOk(v4.isFormat('1.1.1'))
  t.notOk(v4.isFormat(' 1.1.1.1 '))
  t.notOk(v4.isFormat('1.1.1.1 '))
  t.notOk(v4.isFormat(' 1.1.1.1'))
  t.notOk(v4.isFormat('1000.1.1.1'))
  t.notOk(v4.isFormat('1.1000.1.1'))
  t.notOk(v4.isFormat('1.1.1000.1'))
  t.notOk(v4.isFormat('1.1.1.1000'))
  t.end()
})

test('IPv6 addresses tests', t => {
  t.ok(v6.isFormat('0:0:0:0:0:0:0:0'), '8 octets')
  t.ok(v6.isFormat('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'), '8 full octets')
  t.ok(v6.isFormat('::'), 'expanding ::')
  t.ok(v6.isFormat('::1'), '0-9')
  t.ok(v6.isFormat('::f'), 'a-f')
  t.ok(v6.isFormat('::F'), 'upper characters need to match')
  t.ok(v6.isFormat('::ff'), '2 chars')
  t.ok(v6.isFormat('::fff'), '3 chars')
  t.ok(v6.isFormat('::ffff'), '4 chars')
  t.ok(v6.isFormat('::0:0:0:0:0:0:0'), 'expanding left')
  t.ok(v6.isFormat('0:0:0:0:0:0:0::'), 'expanding right')
  t.ok(v6.isFormat('0:0:0:0::0:0:0'), 'expanding middle')
  t.ok(v6.isFormat('::ffff:127.0.0.1'), 'ipv4 in v6')
  t.ok(v6.isFormat('::127.0.0.1')) // TODO: Likely non-standard?!
  t.notOk(v6.isFormat(' 0:0:0:0:0:0:0:0'), 'spaces')
  t.notOk(v6.isFormat('0:0:0:0:0:0:0:0 '), 'spaces')
  t.notOk(v6.isFormat('::g'), 'invalid v6')
  t.notOk(v6.isFormat('::g0'), 'invalid v6')
  t.notOk(v6.isFormat('::gg'), 'invalid v6')
  t.notOk(v6.isFormat('::g'), 'invalid v6')
  t.notOk(v6.isFormat('::ffff:127.0.0.1.1'), 'too many ipv4 numbers')
  t.notOk(v6.isFormat('::ffff:127.0.0'), 'incomplete ipv4')
  t.notOk(v6.isFormat('::ffff:127.0'), 'less complete ipv4')
  t.notOk(v6.isFormat('0:0:0:0:::0:0:0:0'), 'too much expansion')
  t.notOk(v6.isFormat('0:0:0:0:0:0:0:0:0'), 'too many octets')
  t.notOk(v6.isFormat('0:0:0:0:0:0:0:10000'), 'too many digits')
  t.notOk(v6.isFormat(':0:0:0:0:0:0:0:0'), '8 octets + expanding left')
  t.end()
})

test('should convert to buffer IPv4 address', t => {
  const buf = encode('127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '7f000001')
  t.equal(decode(buf), '127.0.0.1')
  t.end()
})

test('should convert to buffer IPv4 address in-place', t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('127.0.0.1', buf, offset)
  t.equal(buf.toString('hex', offset, offset + 4), '7f000001')
  t.equal(decode(buf, offset, 4), '127.0.0.1')

  // Non-standard encodings that are technically working
  // Changing these would mean a breaking change...
  t.equal(decode(encode('256.0.0.0')), '0.0.0.0')
  t.equal(decode(encode('258.0.0.0')), '2.0.0.0')
  t.equal(decode(encode('0.534.0.0')), '0.22.0.0')
  t.equal(decode(encode('0.0.990.0')), '0.0.222.0')
  t.equal(decode(encode('0.0.0.671')), '0.0.0.159')
  // Zero prefixing is allowed, as the encoder supports it.
  // However we need to be aware that
  // https://datatracker.ietf.org/doc/html/rfc3986#section-7.4
  // clearly specifies that this is not a valid URI format.
  t.equal(decode(encode('01.0.0.0')), '1.0.0.0')
  t.equal(decode(encode('0.01.0.0')), '0.1.0.0')
  t.equal(decode(encode('0.0.01.0')), '0.0.1.0')
  t.equal(decode(encode('0.0.0.01')), '0.0.0.1')
  t.equal(decode(encode('001.0.0.0')), '1.0.0.0')
  t.equal(decode(encode('0.001.0.0')), '0.1.0.0')
  t.equal(decode(encode('0.0.001.0')), '0.0.1.0')
  t.equal(decode(encode('0.0.0.001')), '0.0.0.1')
  t.end()
})

test('should convert to buffer IPv6 address', t => {
  const buf = encode('::1')
  t.match(Buffer.from(buf).toString('hex'), /(00){15,15}01/)
  t.equal(decode(buf), '::1')
  testV6(t, '1::', '1::')
  testV6(t, 'abcd::dcba', 'abcd::dcba')
  testV6(t, 'ABCD::DCBA', 'abcd::dcba')
  testV6(t, '::ffff:c0a8:100', '::ffff:c0a8:100')
  testV6(t, '::ffff:ff00', '::ffff:ff00')

  // Non-standard encodings that are technically working
  // Changing these would mean a breaking change...
  testV6(t, ':', '::', 'dangling colon')
  testV6(t, ':::', '::', 'colon parade?!')
  testV6(t, '::::::::::::::::::', '::', 'colon parade++')
  testV6(t, ':12', '::12', 'dangling colon at start')
  testV6(t, '12:', '12::', 'dangling colon at end')
  testV6(t, '1', '1::', '1 octet')
  testV6(t, '1:2', '1:2::', '2 octets')
  testV6(t, '1:2:3', '1:2:3::', '3 octets')
  testV6(t, '1:2:3:4', '1:2:3:4::', '4 octets')
  testV6(t, '1:2:3:4:5', '1:2:3:4:5::', '5 octets')
  testV6(t, '1:2:3:4:5:6', '1:2:3:4:5:6::', '6 octets')
  testV6(t, '1:2:3:4:5:6:7', '1:2:3:4:5:6:7:0', '7 octets')
  testV6(t, '1:2:3:4::5:6:7:8', '1:2:3:4:0:5:6:7', '8 octets + expanding')
  testV6(t, '1:2:3:4:5:6:7:8:', '1:2:3:4:5:6:7:8', '8 octets + expanding right')
  testV6(t, '12345678', '5678::', 'no colon between numbers')
  testV6(t, '::12345', '::2345', 'too many digits')
  testV6(t, '0111:0:0:0:0:0:0', '111::', '0 prefixing')
  testV6(t, '0011:0:0:0:0:0:0', '11::', '0 prefixing')
  testV6(t, '011:0:0:0:0:0:0', '11::', '0 prefixing')
  testV6(t, '001:0:0:0:0:0:0', '1::', '0 prefixing')
  testV6(t, '01:0:0:0:0:0:0', '1::', '0 prefixing')
  testV6(t, '0:01:0:0:0:0:0', '0:1::', '0 prefixing')
  testV6(t, '0:0:01:0:0:0:0', '::1:0:0:0:0:0', '0 prefixing')
  testV6(t, '0:0:0:01:0:0:0', '::1:0:0:0:0', '0 prefixing')
  testV6(t, '0:0:0:0:01:0:0', '::1:0:0:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:01:0', '::1:0:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:0:01', '::1:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:0:001', '::1:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:0:011', '::11:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:0:0011', '::11:0', '0 prefixing')
  testV6(t, '0:0:0:0:0:0:0111', '::111:0', '0 prefixing')
  testV6(t, '::abcd::', '::abcd:0:0', ':: at end and start')
  testV6(t, '::abcd::9876', '::abcd:0:9876', ':: at middle and start')
  testV6(t, 'abcd::9876::', 'abcd:0:9876::', ':: at middle and end')
  testV6(t, '::abcd::9876::', '::abcd:0:9876:0:0', ':: everywhere')
  testV6(t, 'abcd::9876:123:', 'abcd:0:9876:123::', 'dangling colon + expansion')
  testV6(t, '123:::789::::456::::::', '123::789:0:0:0:456')
  testV6(t, 'abcd98764532', '4532::')
  t.end()
})

test('should convert to buffer IPv6 address in-place', t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('::1', buf, offset)
  t.ok(/(00){15,15}01/.test(buf.toString('hex', offset, offset + 16)))
  t.equal(decode(buf, offset, 16), '::1')
  t.equal(decode(encode('1::', buf, offset),
    offset, 16), '1::')
  t.equal(decode(encode('abcd::dcba', buf, offset),
    offset, 16), 'abcd::dcba')
  t.end()
})

test('should convert to buffer IPv6 mapped IPv4 address', t => {
  let buf = encode('::ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')

  buf = encode('ffff::127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), 'ffff000000000000000000007f000001')
  t.equal(decode(buf), 'ffff::7f00:1')

  buf = encode('0:0:0:0:0:ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')

  // Non-standard encodings that are technically working
  // Changing these would mean a breaking change...
  testV6(t, '127.0.0.1', '7f00:1::', 'ipv4 standalone')
  testV6(t, '127.0.0.1::', '7f00:1::', 'endling ::')
  testV6(t, '::127.0.0.1::', '::7f00:1:0:0', ':: start and end ::')
  testV6(t, ':0:ff::127.0.0.1::', '::ff:0:7f00:1:0:0', 'dangling double colon')
  testV6(t, ':0:ff::127.0.0.1:', '::ff:0:7f00:1:0', 'dangling colon')
  testV6(t, '127.0.0.1:::::::::::::', '7f00:1::', 'colon parade')
  testV6(t, '::ffff:999.0.0.1', '::ffff:e700:1', 'wrong ipv4')
  testV6(t, '::ffff:1.999.0.1', '::ffff:1e7:1', 'wrong ipv4')
  testV6(t, '::ffff:1.0.999.1', '::ffff:100:e701', 'wrong ipv4')
  testV6(t, '::ffff:1.0.0.999', '::ffff:100:e7', 'wrong ipv4')
  testV6(t, ':0:ff::999.1.1.1:', '::ff:0:e701:101:0', 'alt wrong ipv4')
  testV6(t, ':0:ff::1.999.1.1:', '::ff:0:1e7:101:0', 'alt wrong ipv4')
  testV6(t, ':0:ff::1.1.999.1:', '::ff:0:101:e701:0', 'alt wrong ipv4')
  testV6(t, ':0:ff::1.1.1.999:', '::ff:0:101:1e7:0', 'alt wrong ipv4')
  testV6(t, '127.0.0.1:0:0', '7f00:1::', 'ipv4 at the start')
  // the regular encoder would identify the ip as ipv4 here, using ipv6 instead
  t.equal(decode(v6.encode('127.0.0.1')), '7f00:1::', 'ipv4 as is shouldnt work')
  t.end()
})

function testV6 (t, input, output, message) {
  message = `${input} → ${output}${message ? `- ${message}` : ''}`
  let result = v6.decode(v6.encode(input))
  // First, lets do a general en- & decode
  if (result === output) {
    // Then, use a own input buffer to make sure that all bytes are written
    result = v6.decode(v6.encode(input, crypto.randomBytes(v6.size), 0), 0)
    if (result === output) {
      // Then use a buffer that has random data before & after and write in the
      // middle to make sure that the implementation doesn't exceed bounds.
      // (Do this more than once to make sure randomness doesn't hide error
      let buffSlice, safeSlice
      for (let i = 0; i < 4; i++) {
        const buff = crypto.randomBytes(v6.size + 8)
        const safe = Buffer.from(buff)
        v6.decode(v6.encode(input, buff, 4), 4)
        buffSlice = sliceBounds(buff)
        safeSlice = sliceBounds(safe)
        if (buffSlice !== safeSlice) {
          break
        }
      }
      t.equal(buffSlice, safeSlice, `${message} (verified)`)
    } else {
      t.equal(result, output, `${message} (0 offset byob)`)
    }
  } else {
    t.equal(result, output, message)
  }
}

function sliceBounds (buff) {
  return Buffer.concat([buff.slice(0, 4), buff.slice(buff.length - 4)]).toString('hex')
}

test('error decoding a buffer of unexpected length', t => {
  t.throws(() => decode(Buffer.alloc(0)))
  t.end()
})

test('should use on-demand allocation', t => {
  let buf = encode('127.0.0.1', Buffer.alloc)
  t.equal(buf.toString('hex'), '7f000001')
  buf = encode('127.0.0.1', size => Buffer.alloc(size + 2), 4)
  t.equal(buf.toString('hex'), '000000007f0000010000')
  t.end()
})

test('dedicated encoding v4/v6', t => {
  t.deepEqual(encode('127.0.0.1'), v4.encode('127.0.0.1'))
  t.deepEqual(encode('::'), v6.encode('::'))
  t.end()
})

test('sizeOf/familyOf test', t => {
  t.equal(sizeOf('127.0.0.1'), 4)
  t.equal(familyOf('127.0.0.1'), 1)
  t.equal(sizeOf('::'), 16)
  t.equal(familyOf('::'), 2)
  t.throws(() => sizeOf(''))
  t.throws(() => familyOf(''))
  t.throws(() => sizeOf('?'))
  t.throws(() => familyOf('?'))
  t.end()
})
