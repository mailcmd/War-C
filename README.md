# War-C

War-C (**W**eb **AR**row **C**ontrol) is a simple javascript class to allow control navigation on a webpage with arrow keys on your keyboard. The concept is simple, you can move throught some selected elements on your webpage just pressing arrow keys and trigger click event pressing ENTER key.

## How it works?

First you need instantiate the class and second... well, basically that's all, it is ready. But obviously if you like can pass some parameters for better tunning of War-C. 

Once you create an instance of the class, you will be able to move the cursor jumping between all elements that match selector (selected set). You can set a selector or use the default: "`button:visible, input[type="button"]:visible, a:visible`". 

## Parameters

- `activeClass` (default: '--ac-active')
   
  This class will be added to the currently selected element and removed from all other elements belonging to the selected set. You can create CSS rules to decorate this class or you can let War-C do it for you (I wouldn't).
   
- `selector` (default: 'button:visible, input[type="button"]:visible, a:visible')
  
  This string allows to specify which elements will be part of the selected set.

- `loopEnabled` (default: false)

  If is `true`, when you move in a direction where there are no elements left in the selected set, War-C will continue to search for elements starting from the opposite end of that direction.

- `anglePenalty` (default: 1)

  When you move in one direction, War-C selects all the elements that are in that direction with a viewing angle of almost 180 degrees, then calculates the distance to each of them, and selects the closest one. Well, this is not quite true, with `anglePenalty` equal to 1, War-C will apply a penalty to all those elements that are not at zero angle with respect to the chosen direction. 
  
  <pre>
                       ┌─────────┐
                       │         │
                       │    A    │
                       │         │
                      /└─────────┘
                     //
                    //
                   //dist: 75
                  // angle: 62º
                 //
                //
       ┌────────┐               dist: 110         ┌─────────┐
       │        │               angle: 0º         │         │
       │    S   │================================ │    B    │
       │        │                                 │         │
       └────────┘                                 └─────────┘
                 \\
                  \\  dist: 62
                   \\ angle: 54º
                    \\
                     \\
                      \┌─────────┐
                       │         │
                       │    C    │
                       │         │
                       └─────────┘
  </pre>

  For example, in this case, if War-C did not take angles into account, it would jump to "C" because it is the closest. But we don't always want it to work that way. That's why War-C allows penalizing elements that are not in direct angle of view. This penalty will make "A" and "C" look farther away. To do this, to the real distance calculated, War-C will add 
  
    **`distance * (angle/90) * anglePenalty`** 
  
  De este modo, si `anglePenalty` es 1, para War-C la distancia entre "S" y "A" será 
  
    **`75 + 75 * (62/90) * 1 = 126.667`**
  
  y entre "S" y "C" 
  
    **`62 + 62 * (54/90) * 1 = 99.2`**

  Note that even in this case, the penalty will not be enough, and "C", with `anglePenalty` equal to 1, will still be at a shorter distance than "A" and "B". That is why `anglePenalty` exists. If for example `anglePenalty` were equal to 2, the distance to "C" would be 136.4, which would make War-C jump to "B" instead of jumping to "C".

- `remember` (default: true)

  
- allowMouseSelect: true,
- enterTriggerClick: true,



