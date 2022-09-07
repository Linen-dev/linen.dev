import Example from '../Example';
import Message from '../../../components/Message';
import { EMOJIS } from '../../../components/Message/Emoji/utilities/emojis';

const STACK_TRACE_EXAMPLE = `
Apr 07 04:38:57 ip-10-0-74-131 kernel: watchdog: BUG: soft lockup - CPU#1 stuck for 22s! [kauditd:22]
Apr 07 04:38:57 ip-10-0-74-131 kernel: Modules linked in: ppdev serio_raw parport_pc parport sch_fq_codel ip_tables x_tables autofs4 btrfs zstd_compress raid10 raid456 async_raid6_recov async_memcpy async_pq async_xor async_tx xor raid6_pq libcrc32c raid1 raid0 multipath linear crct10dif_pclmul crc32_pclmul ghash_clmulni_intel aesni_intel crypto_simd cryptd glue_helper ena
Apr 07 04:38:57 ip-10-0-74-131 kernel: CPU: 1 PID: 22 Comm: kauditd Not tainted 5.4.0-1071-aws #76~18.04.1-Ubuntu
Apr 07 04:38:57 ip-10-0-74-131 kernel: Hardware name: Amazon EC2 t3.small/, BIOS 1.0 10/16/2017
Apr 07 04:38:57 ip-10-0-74-131 kernel: RIP: 0010:_raw_spin_unlock_irqrestore+0x15/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel: Code: e8 b0 a3 65 ff 4c 29 e0 4c 39 f0 76 cf 80 0b 08 eb 8a 90 90 90 0f 1f 44 00 00 55 48 89 e5 e8 66 0c 68 ff 66 90 48 89 f7 57 9d &lt;0f&gt; 1f 44 00 00 5d c3 0f 1f 40 00 0f 1f 44 00 00 55 48 89 e5 c6 07
Apr 07 04:38:57 ip-10-0-74-131 kernel: RSP: 0018:ffffa385c00cbe08 EFLAGS: 00000246 ORIG_RAX: ffffffffffffff13
Apr 07 04:38:57 ip-10-0-74-131 kernel: RAX: 0000000000000001 RBX: ffffffff96fd3b70 RCX: 0000000000000769
Apr 07 04:38:57 ip-10-0-74-131 kernel: RDX: 000000000000076a RSI: 0000000000000246 RDI: 0000000000000246
Apr 07 04:38:57 ip-10-0-74-131 kernel: RBP: ffffa385c00cbe08 R08: 0000000000000000 R09: ffffffff958b4801
Apr 07 04:38:57 ip-10-0-74-131 kernel: R10: ffffa385c00cbd98 R11: 0000000000000000 R12: ffff907db699ff00
Apr 07 04:38:57 ip-10-0-74-131 kernel: R13: ffffffff96fd3b84 R14: ffff907db699ffd4 R15: ffff907db699ff00
Apr 07 04:38:57 ip-10-0-74-131 kernel: FS:  0000000000000000(0000) GS:ffff907dfb500000(0000) knlGS:0000000000000000
Apr 07 04:38:57 ip-10-0-74-131 kernel: CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
Apr 07 04:38:57 ip-10-0-74-131 kernel: CR2: 000055c63d5d9ee0 CR3: 0000000008a0a006 CR4: 00000000007606e0
Apr 07 04:38:57 ip-10-0-74-131 kernel: DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
Apr 07 04:38:57 ip-10-0-74-131 kernel: DR3: 0000000000000000 DR6: 00000000fffe0ff0 DR7: 0000000000000400
Apr 07 04:38:57 ip-10-0-74-131 kernel: PKRU: 55555554
Apr 07 04:38:57 ip-10-0-74-131 kernel: Call Trace:
Apr 07 04:38:57 ip-10-0-74-131 kernel:  skb_queue_head+0x47/0x50
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_rehold_skb+0x18/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_send_queue+0xb6/0xf0
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? kauditd_retry_skb+0x20/0x20
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kauditd_thread+0xa0/0x250
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? __wake_up_pollfree+0x40/0x40
Apr 07 04:38:57 ip-10-0-74-131 kernel:  kthread+0x121/0x140
Apr 07 04:38:57 ip-10-0-74-131 kernel:  ? auditd_reset+0xa0/0xa0
`.trim();

const JAVASCRIPT_EXAMPLE = `
import React from 'react'

export default function Message({ children }) {
  return (<div>{children}</div>)
}
`.trim();

const PYTHON_EXAMPLE = `
for i in range(3):
	print("===> Outer Loop")
	print(f"i = {i}")
	for j in range(2):
		print("Inner Loop")
		print(f"j = {j}")
`.trim();

const RUBY_EXAMPLE = `
def sum_eq_n?(arr, n)
  return true if arr.empty? && n == 0
  arr.product(arr).reject { |a,b| a == b }.any? { |a,b| a + b == n }
end
`.trim();

const CODE_EXAMPLE = `
[root@visibility99 osquery]# curl -X POST
<https://xxxxxxxxxxxx:8080/api/v1/enroll> -d '{}' curl: (52) Empty reply from server
`.trim();

const JSON_EXAMPLE = `
{"foo": "bar", "baz": "qux"}
`.trim();

const STATIC_TEXT = `
Hey!

Can you help me?

##ifdef
  test
    is this correct
##endif
`.trim();

const HTML_EXAMPLE = `
&lt;div&gt;foo &amp; bar&lt;/div&gt;
`.trim();

const MARKDOWN_EXAMPLE = `
Hey 👋
Quick note, I saw that there's a spelling error in the *license dashboard* UI:
&gt; 1 devices @ $1.00/device/month
&gt; Billed *anually* at $12.00/yr
&gt; Next payment on Apr 13, 2023
Should be *annually*.

## CHANGELOG

• Remove the lorem_files virtual table, which was used to parse .TXT format files (table was only available in the Windows platform version of lorem).
• Remove the LOREM virtual tables.
• Remove ssdeep as one of the hash types supported by the hash virtual table (affects all platforms)
• Update the zlib dependency from v1.2.11 to v1.2.12, to address CVE CVE-ABCD-1234.
• Update the OpenSSL dependency from version 1.1.1l to 1.1.1n to address CVE CVE-ABCD-5678.
• Update the expat dependency from version 2.2.10 to 2.4.7, to address published CVEs.

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6
`.trim();

const WHITESPACE_EXAMPLE = `
Run cypress-io/github-action@v4
  with:
    build: npm run build
    start: npm start
    record: false
    component: false
undefined:18
  },
  ^
`;

const BROKEN_LINK_EXAMPLE = `
<http://-how-to-register>
`.trim();

export default function MessageExample() {
  return (
    <Example header="Message">
      <Example description="Renders text.">
        <Message text="Lorem ipsum, dolor sit amet." />
      </Example>
      <Example description="Renders bold text.">
        <Message text="Lorem *ipsum*, dolor sit amet." />
      </Example>
      <Example description="Renders italic text.">
        <Message text="Lorem _ipsum_, dolor sit amet." />
      </Example>
      <Example description="Renders strikethrough text.">
        <Message text="Lorem ~ipsum~, dolor sit amet." />
      </Example>
      <Example description="Renders emojis.">
        <Message text="Hello, world! :)" />
      </Example>
      <Example description="Renders mentions.">
        <Message text="Hey, <@uid1234>!" />
      </Example>
      <Example description="Renders channels.">
        <Message text="Hey, <#general>!" />
      </Example>
      <Example description="Renders https and http links.">
        <Message text="Hey, <https://linen.dev> rocks!" />
        <Message text="Hey, <http://linen.dev> rocks!" />
      </Example>
      <Example description="Renders mailto links">
        <Message text="Contact us: <mailto:support@linen.dev>!" />
        <Message text="Contact us: <mailto:support@linen.dev|Linen Support>!" />
      </Example>
      <Example description="Renders inline code blocks.">
        <Message text="Hey, `const answer = 42`!" />
        <Message text="Has anyone ran into this error before? Just trying to run a spec. Other things like `db:migrate` fail for `PG:InsufficientPrivilege` as well." />
      </Example>
      <Example description="Renders block code blocks, with highlighting.">
        <Message text={`\`\`\`${STACK_TRACE_EXAMPLE}\`\`\``} />
        <Message text={`\`\`\`${CODE_EXAMPLE}\`\`\``} />
        <Message text={`\`\`\`${JAVASCRIPT_EXAMPLE}}\`\`\``} />
        <Message text={`\`\`\`${PYTHON_EXAMPLE}\`\`\``} />
        <Message text={`\`\`\`${RUBY_EXAMPLE}\`\`\``} />
      </Example>
      <Example description="Renders markdown.">
        <Message text={MARKDOWN_EXAMPLE} />
      </Example>
      <Example description="Renders whitespace.">
        <Message text={STATIC_TEXT} />
      </Example>
      <Example description="Renders images.">
        <Message text="<http://localhost:3000/yc-logo.png>" />
      </Example>
      <Example description="It converts inline code to block code if newlines are present.">
        <Message text={`\`${WHITESPACE_EXAMPLE} \``} />
      </Example>
      <Example description="Renders videos.">
        <Message text="<https://www.youtube.com/embed/Xsew54QshN8>" />
        <Message text="<https://www.youtube.com/watch?v=q3n8rvREbNM>" />
        <Message text="<https://youtu.be/615EqK_9-f0>" />
      </Example>
      <Example description="Renders tweets.">
        <Message text="<https://twitter.com/kotlin/status/1367535067581546501>" />
        <Message text="<https://twitter.com/kotlin/status/1367535067581546501?s=21>" />
      </Example>
      <Example description="Renders HTML entities.">
        <Message text={`\`${HTML_EXAMPLE}\``} />
        <Message text={`\`\`\`${HTML_EXAMPLE}\`\`\`\``} />
      </Example>
      <Example description="Renders JSON.">
        <Message text={`\`\`\`${JSON_EXAMPLE}\`\`\``} />
      </Example>
      <Example description="Renders broken links.">
        <Message text={BROKEN_LINK_EXAMPLE} />
      </Example>
      <Example description="Renders reactions.">
        <Message
          text="Hello, world! :)"
          reactions={EMOJIS.map((emoji) => ({ type: emoji, count: 1 }))}
        />
      </Example>
    </Example>
  );
}
