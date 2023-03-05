import { component$, useBrowserVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import Toggle from '~/components/elements/Toggle';
import TextInput, { RawTextInput } from '~/components/elements/TextInput';

import { Gradient } from '~/analyze/functions/HexUtils';

function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

function convertToHex(rgb: number[]) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

function convertToRGB(hex: string) {
  const color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const formats = [
  '&#$1$2$3$4$5$6$f$c',
  '<#$1$2$3$4$5$6>$f$c',
  '&x&$1&$2&$3&$4&$5&$6$f$c',
  '§x§$1§$2§$3§$4§$5§$6$f$c',
  '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]'
]

const presets = {
  'SimplyMC': ["#00FFE0", "#EB00FF"],
  'Rainbow': ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
  'Skyline': ["#1488CC", "#2B32B2"],
  'Mango': ["#FFE259", "#FFA751"],
  'Vice City': ["#3494E6", "#EC6EAD"],
  'Dawn': ["#F3904F", "#3B4371"],
  'Rose': ["#F4C4F3", "#FC67FA"],
  'Firewatch': ["#CB2D3E", "#EF473A"],
};

export default component$(() => {
  const store: any = useStore({
    colors: [],
    text: 'SimplyMC',
    format: '&#$1$2$3$4$5$6$f$c',
    formatchar: '&',
    customFormat: false,
    prefix: '',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alerts: [],
  }, { deep: true });

  useBrowserVisibleTask$(() => {
    store.colors = ["#00FFE0", "#EB00FF"];
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js"></script>
      <div class="mt-10 min-h-[60px] w-full">
        <h1 class="font-bold text-purple-100 text-4xl mb-2">
          Hex Gradients
        </h1>
        <h2 class=" mb-24">
          Hex color gradient creator
        </h2>

        <h1 class="font-bold text-purple-100 text-4xl mb-2">
          Output
        </h1>
        <h2 class=" mb-4">
          This is what you put in the chat. Click on it to copy.
        </h2>
        <textarea disabled class="w-full bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-4 break-words" onClick$={(event: any) => {
          navigator.clipboard.writeText(event.target!.value);
          const alert = {
            class: 'text-green-500',
            text: 'Copied to clipboard!',
          }
          if (event.target!.value.length > 256) {
            const alert2 = {
              class: 'text-red-500',
              text: 'This text is over 256 characters and may not fit in the chat box!',
            }
            store.alerts.push(alert2);
            setTimeout(() => {
              store.alerts.splice(store.alerts.indexOf(alert2), 1);
            }, 2000);
          }
          store.alerts.push(alert);
          setTimeout(() => {
            store.alerts.splice(store.alerts.indexOf(alert), 1);
          }, 1000);
        }}
          value={
            (() => {
              let colors = store.colors.map((color: string) => convertToRGB(color));
              if (colors.length < 2) colors = [convertToRGB("#00FFE0"), convertToRGB("#EB00FF")];

              let output = store.prefix;
              const text = store.text ? store.text : 'SimplyMC';

              const gradient = new Gradient(colors, text.replace(/ /g, '').length);

              for (let i = 0; i < text.length; i++) {
                const char = text.charAt(i);
                if (char == ' ') {
                  output += char;
                  continue;
                }

                const hex = convertToHex(gradient.next());
                let hexOutput = store.format;
                for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
                let formatCodes = '';
                if (store.format.includes('$f')) {
                  if (store.bold) formatCodes += store.formatchar + 'l';
                  if (store.italic) formatCodes += store.formatchar + 'o';
                  if (store.underline) formatCodes += store.formatchar + 'n';
                  if (store.strikethrough) formatCodes += store.formatchar + 'm';
                }
            
                hexOutput = hexOutput.replace('$f', formatCodes);
                hexOutput = hexOutput.replace('$c', char);
                output += hexOutput;
              }
              return output;
            })()
          }
        />
        {
          store.alerts.map((alert: any) => {
            return <p class={alert.class}>{alert.text}</p>
          })
        }

        <h1 class={`text-6xl my-6 break-all max-w-7xl -space-x-[1px] font${store.bold ? '-bold' : ''}${store.italic ? '-italic' : ''}`}>
          {(() => {
            const text = store.text ? store.text : 'SimplyMC';

            let colors = store.colors.map((color: string) => convertToRGB(color));
            if (colors.length < 2) colors = [convertToRGB("#00FFE0"), convertToRGB("#EB00FF")];

            const gradient = new Gradient(colors, text.replace(/ /g, '').length);

            let hex = '';
            return text.split('').map((char: string) => {
              if (char != ' ') hex = convertToHex(gradient.next());
              return <span style={`color: #${hex};`} class={`font${store.underline ? '-underline' : ''}${store.strikethrough ? '-strikethrough' : ''}`}>{char}</span>;
            });
          })()}
        </h1>

        <div class="grid sm:grid-cols-4 gap-2">
          <div class="sm:pr-4">
            <label class="font-bold">
              {store.colors.length} Colors
            </label>
            <div class="mt-2 mb-4">
              <a onClick$={() => {
                store.colors.push(getRandomColor());
              }} class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2">Add</a>
              <a onClick$={() => {
                store.colors.pop();
              }} class={`text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2 ml-2 ${store.colors.length < 3 && 'hidden'}`}>Remove</a>
            </div>
            <div class="overflow-auto max-h-32 sm:max-h-[500px]">
              {store.colors.map((color: string, i: number) => {
                return <>
                  <label>
                      Hex Color {i + 1}
                  </label>
                  <input id={`color${i + 1}`} value={color} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4" data-jscolor={JSON.stringify({ preset: 'small dark', position: 'bottom', palette: store.colors })} onInput$={(event: any) => { store.colors[i] = event.target!.value; }} />
                  <script dangerouslySetInnerHTML={'jscolor.install()'}></script>
                </>
              })}
            </div>
          </div>
          <div class="sm:col-span-3">
            <TextInput id="input" value={store.text} placeholder="SimplyMC" onInput$={(event: any) => store.text = event.target!.value}>
              Input Text
            </TextInput>

            <div class="grid sm:grid-cols-2 gap-2">
              <div>
                <label for="format">
                  Output Format
                </label>
                <select id="format" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-3 mt-2" onChange$={
                  (event: any) => {
                    if (event.target!.value == 'custom') return store.customFormat = true;
                    store.customFormat = false;
                    store.format = event.target!.value;
                  }
                }>
                  {
                    formats.map((format: any) => {
                      return <option value={format}>{format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '')}</option>
                    })
                  }
                  <option value={"custom"}>
                    {store.customFormat ? store.format.replace('$1', 'r').replace('$2', 'r').replace('$3', 'g').replace('$4', 'g').replace('$5', 'b').replace('$6', 'b').replace('$f', '').replace('$c', '') : 'Custom'}
                  </option>
                </select>
              </div>
              <TextInput id="formatchar" value={store.formatchar} placeholder="&" onInput$={(event: any) => store.formatchar = event.target!.value}>
                Format Character
              </TextInput>
            </div>

            {
              store.customFormat && <>

                <TextInput id="format" value={store.format} placeholder="&#$1$2$3$4$5$6$f$c" onInput$={(event: any) => store.format = event.target!.value} class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mt-2 mb-4">
                  Custom Format
                </TextInput>
                <div class="pb-4">
                  <p>Placeholders:</p>
                  <p>$1 - (R)RGGBB</p>
                  <p>$2 - R(R)GGBB</p>
                  <p>$3 - RR(G)GBB</p>
                  <p>$4 - RRG(G)BB</p>
                  <p>$5 - RRGG(B)B</p>
                  <p>$6 - RRGGB(B)</p>
                  <p>$f - Formatting</p>
                  <p>$c - Character</p>
                </div>
              </>
            }


            <TextInput id="prefix" value={store.prefix} placeholder="example: '/nick '" onInput$={(event: any) => store.prefix = event.target!.value}>
              Prefix (Usually used for commands)
            </TextInput>

            <label for="preset">
              Color Preset
            </label>
            <select id="preset" class="w-full text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-3 mt-2 mb-4" onChange$={
              (event: any) => {
                store.colors = [];
                setTimeout(() => {
                  store.colors = presets[event.target!.value as keyof typeof presets];
                }, 1);
              }
            }>
              {
                Object.keys(presets).map((preset: any) => {
                  return <option value={preset}>{preset}</option>
                })
              }
            </select>

            <label>
              Presets
            </label>
            <div class="mt-2">
              <a class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-3 mr-2" onClick$={() => {
                navigator.clipboard.writeText(JSON.stringify(store));
                const alert = {
                  class: 'text-green-500',
                  text: 'Successfully exported preset to clipboard!',
                }
                store.alerts.push(alert);
                setTimeout(() => {
                  store.alerts.splice(store.alerts.indexOf(alert), 1);
                }, 2000);
              }}>Export</a>
              <RawTextInput name="import" placeholder="Import (Paste here)" onInput$={(event: any) => {
                const json = JSON.parse(event.target!.value);
                Object.keys(json).forEach((key: any) => {
                  store[key] = json[key];
                });
                const alert = {
                  class: 'text-green-500',
                  text: 'Successfully imported preset!',
                }
                store.alerts.push(alert);
                setTimeout(() => {
                  store.alerts.splice(store.alerts.indexOf(alert), 1);
                }, 2000);
              }} />
            </div>
            <div class="mt-6 mb-4 space-y-4">
              <Toggle id="bold" checked={store.bold} onChange$={(event: any) => store.bold = event.target!.checked}>
                Bold - {store.formatchar + 'l'}
              </Toggle>
              <Toggle id="strikethrough" checked={store.strikethrough} onChange$={(event: any) => store.strikethrough = event.target!.checked}>
                Strikethrough - {store.formatchar + 'm'}
              </Toggle>
              <Toggle id="underline" checked={store.underline} onChange$={(event: any) => store.underline = event.target!.checked}>
                Underline - {store.formatchar + 'n'}
              </Toggle>
              <Toggle id="italic" checked={store.italic} onChange$={(event: any) => store.italic = event.target!.checked}>
                Italic - {store.formatchar + 'o'}
              </Toggle>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Hex Gradient Creator',
  meta: [
    {
      name: 'description',
      content: 'Hex color gradient creator'
    },
    {
      name: 'og:description',
      content: 'Hex color gradient creator'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}