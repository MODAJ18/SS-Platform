import {
    animation, useAnimation, state,
    trigger, animateChild, group,
    transition, animate, style, query
} from '@angular/animations';


// Reusable animations
export const transitionAnimation_sia = animation([
  style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: '{{ opacityStart }}'
        })
      ]),
      query(':enter', [
        style({ 
          left: '{{ enterOffset }}',
          })
      ]),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':leave', [
          animate('200ms ease-out', style({ left: '{{ leaveOffset }}'}))
        ], { optional: true }),
        query(':enter', [
          animate('500ms 300ms ease-out', style({ left: '0%',
                                            opacity: '{{ opacityEnd }}' }))
        ])
      ]),
      query(':enter', animateChild())
]);


// Main trigger animations
export const slideInAnimation =
  trigger('routeAnimation', [
    // 1
    transition('* => orderHistoryTr', [
      useAnimation(transitionAnimation_sia, {
        params: {
          enterOffset: '0%',
          leaveOffset: '100%',
          opacityStart: '0',
          opacityEnd: '1',
        }
      })
    ]),

    // 2
    transition('* => branchSalesTr', [
      useAnimation(transitionAnimation_sia, {
        params: {
          enterOffset: '0%',
          leaveOffset: '100%',
          opacityStart: '0',
          opacityEnd: '1',
        }
      })
    ]),

    transition('* => productPerformanceTr', [
      useAnimation(transitionAnimation_sia, {
        params: {
          enterOffset: '0%',
          leaveOffset: '100%',
          opacityStart: '0',
          opacityEnd: '1',
        }
      })
    ]),

    transition('* => futureSalesTr', [
      useAnimation(transitionAnimation_sia, {
        params: {
          enterOffset: '0%',
          leaveOffset: '100%',
          opacityStart: '0',
          opacityEnd: '1',
        }
      })
    ]),
  ]);

export const menuHoverAnimation =  
  trigger('menuHover', [
    state('on', style({
      // transform: "translateY(3px) scale(1.1, 1.1)",
      transform: "translateY(3px)",
      boxShadow: "0px 3px 10px gray",
      padding: "10px 20px",
      borderRadius: "20px / 20px",
    })),
    state('off', style({
      transform: "translateY(0px)"
    })),
    transition('on => *', [
      animate('0.1s')
    ]),
    transition('off => on', [
      animate('0.1s')
    ]),
  ]);

export const menuIconHoverAnimation =  
  trigger('menuIconHover', [
    state('analytics', style({
      transform: "translateY(10px) translateX(5px) scale(1.2, 1.2)"
    })),
    state('off', style({
    })),
    transition('analytics => *', [
      animate('0.1s')
    ]),
    transition('off => analytics', [
      animate('0.1s')
    ]),
  ]);

  // [
  //   useAnimation(transitionAnimation_sia, {
  //     params: {
  //       enterOffset: '0%',
  //       leaveOffset: '100%',
  //       opacityStart: '0',
  //       opacityEnd: '1',
  //     }
  //   })
  // ]
export const filterHoverAnimation = animation([
  style({
    transform: "{{ transformation }}",  // scale(1.2, 1.2)
  }),
  animate('{{ time }}')
]);

// export const filterHover_ytrigger = 
//   trigger('filterHover_ytrigger', [
//     transition('on => off', [
//       useAnimation(filterHoverAnimation, {
//         params: {
//           transformation: "none",
//           time: "0.2s"
//         }
//       })
//     ]),
//     transition('off => on', [
//       useAnimation(filterHoverAnimation, {
//         params: {
//           transformation: "scale(1.2, 1.2)",
//           time: "0.2s"
//         }
//       })
//     ]),
//   ]);

var filter_transform = "scale(1.2, 1.2)";
var filter_duration = "0.1s";
var filter_bg = "#570202";
var filter_boxshadow = "6px 3px 3px #000000";
export const filterHover_allTrigger = 
  trigger('filterHover_allTrigger', [
    state('all', style({ 
      transform: filter_transform,
      backgroundColor: filter_bg,
      boxShadow: filter_boxshadow
    })),
    state('off', style({})),
    transition('all => off', [ animate(filter_duration) ]),
    transition('off => all', [ animate(filter_duration) ]),
  ]);
export const filterHover_yTrigger = 
  trigger('filterHover_yTrigger', [
    state('year', style({ 
      transform: filter_transform,
      backgroundColor: filter_bg,
      boxShadow: filter_boxshadow
    })),
    state('off', style({})),
    transition('year => off', [ animate(filter_duration) ]),
    transition('off => year', [ animate(filter_duration) ]),
  ]);
export const filterHover_qTrigger = 
  trigger('filterHover_qTrigger', [
    state('quarter', style({ 
      transform: filter_transform,
      backgroundColor: filter_bg,
      boxShadow: filter_boxshadow
    })),
    state('off', style({})),
    transition('quarter => off', [ animate(filter_duration) ]),
    transition('off => quarter', [ animate(filter_duration) ]),
  ]);
export const filterHover_mTrigger = 
  trigger('filterHover_mTrigger', [
    state('month', style({ 
      transform: filter_transform,
      backgroundColor: filter_bg,
      boxShadow: filter_boxshadow
    })),
    state('off', style({})),
    transition('month => off', [ animate(filter_duration) ]),
    transition('off => month', [ animate(filter_duration) ]),
  ]);
export const filterHover_dTrigger = 
  trigger('filterHover_dTrigger', [
    state('day', style({ 
      transform: filter_transform,
      backgroundColor: filter_bg,
      boxShadow: filter_boxshadow
    })),
    state('off', style({})),
    transition('day => off', [ animate(filter_duration) ]),
    transition('off => day', [ animate(filter_duration) ]),
  ]);

var KPI_duration = "0.2s";
var KPI_bg = "#053d5b"
export const KPIHover1_Trigger = 
  trigger('KPIHover1_Trigger', [
    state('KPI1', style({ 
      backgroundColor: KPI_bg,
    })),
    state('off', style({})),
    transition('KPI1 => off', [ animate(KPI_duration) ]),
    transition('off => KPI1', [ animate(KPI_duration) ]),
  ]);
  export const KPIHover2_Trigger = 
  trigger('KPIHover2_Trigger', [
    state('KPI2', style({ 
      backgroundColor: KPI_bg,
    })),
    state('off', style({})),
    transition('KPI2 => off', [ animate(KPI_duration) ]),
    transition('off => KPI2', [ animate(KPI_duration) ]),
  ]);

