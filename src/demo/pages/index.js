import * as simples from './simple';
import Groups from './groups';
import Copy from './copy';
import Horizontal from './horizontal';




export default [
  { title: 'Simple with window scroller', type: simples.Simple },
  { title: 'Inside Sroll View', type: simples.SimpleScroller },
  { title: 'DnD between Containers', type: Groups },
  { title: 'Copy form source', type: Copy },
  { title: 'Horizontal', type: Horizontal },
]